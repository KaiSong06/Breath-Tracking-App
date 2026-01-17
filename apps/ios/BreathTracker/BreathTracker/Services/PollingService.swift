import Foundation
import Combine

/// Breathing data service implementation using HTTP polling
final class PollingService: BreathingDataService {
    
    // MARK: - Published Properties
    
    @Published private(set) var latestData: BreathingData?
    @Published private(set) var connectionState: ConnectionState = .disconnected
    
    var latestDataPublisher: Published<BreathingData?>.Publisher { $latestData }
    var connectionStatePublisher: Published<ConnectionState>.Publisher { $connectionState }
    
    // MARK: - Private Properties
    
    private var pollingTimer: Timer?
    private let urlSession: URLSession
    private let pollingInterval: TimeInterval
    private var cancellables = Set<AnyCancellable>()
    
    // MARK: - Initialization
    
    init(
        urlSession: URLSession = .shared,
        pollingInterval: TimeInterval = Constants.Polling.intervalSeconds
    ) {
        self.urlSession = urlSession
        self.pollingInterval = pollingInterval
    }
    
    deinit {
        stopMonitoring()
    }
    
    // MARK: - BreathingDataService
    
    func startMonitoring() {
        guard pollingTimer == nil else { return }
        
        connectionState = .connecting
        
        // Fetch immediately, then start timer
        Task {
            await fetchLatestData()
        }
        
        // Schedule periodic polling
        pollingTimer = Timer.scheduledTimer(
            withTimeInterval: pollingInterval,
            repeats: true
        ) { [weak self] _ in
            Task {
                await self?.fetchLatestData()
            }
        }
    }
    
    func stopMonitoring() {
        pollingTimer?.invalidate()
        pollingTimer = nil
        connectionState = .disconnected
    }
    
    func fetchHistory(limit: Int) async throws -> [BreathingData] {
        guard let baseURL = Constants.API.historyURL else {
            throw BreathingDataError.invalidURL
        }
        
        // Add query parameter for limit
        var components = URLComponents(url: baseURL, resolvingAgainstBaseURL: false)
        components?.queryItems = [URLQueryItem(name: "limit", value: String(limit))]
        
        guard let url = components?.url else {
            throw BreathingDataError.invalidURL
        }
        
        do {
            let (data, response) = try await urlSession.data(from: url)
            
            guard let httpResponse = response as? HTTPURLResponse else {
                throw BreathingDataError.noData
            }
            
            guard (200...299).contains(httpResponse.statusCode) else {
                throw BreathingDataError.serverError(httpResponse.statusCode)
            }
            
            let decoder = JSONDecoder()
            let history = try decoder.decode([BreathingData].self, from: data)
            return history
            
        } catch let error as BreathingDataError {
            throw error
        } catch let error as DecodingError {
            throw BreathingDataError.decodingError(error)
        } catch {
            throw BreathingDataError.networkError(error)
        }
    }
    
    // MARK: - Private Methods
    
    @MainActor
    private func fetchLatestData() async {
        guard let url = Constants.API.latestDataURL else {
            connectionState = .error("Invalid URL")
            return
        }
        
        do {
            let (data, response) = try await urlSession.data(from: url)
            
            guard let httpResponse = response as? HTTPURLResponse else {
                connectionState = .error("Invalid response")
                return
            }
            
            guard (200...299).contains(httpResponse.statusCode) else {
                connectionState = .error("Server error: \(httpResponse.statusCode)")
                return
            }
            
            let decoder = JSONDecoder()
            let breathingData = try decoder.decode(BreathingData.self, from: data)
            
            latestData = breathingData
            connectionState = .connected
            
        } catch {
            connectionState = .error(error.localizedDescription)
        }
    }
}

// MARK: - Mock Service for Development

/// Mock polling service that generates simulated data for development/testing
final class MockPollingService: BreathingDataService {
    
    @Published private(set) var latestData: BreathingData?
    @Published private(set) var connectionState: ConnectionState = .disconnected
    
    var latestDataPublisher: Published<BreathingData?>.Publisher { $latestData }
    var connectionStatePublisher: Published<ConnectionState>.Publisher { $connectionState }
    
    private var timer: Timer?
    private var apneaSimulationEnabled = false
    
    func startMonitoring() {
        connectionState = .connecting
        
        // Simulate connection delay
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) { [weak self] in
            self?.connectionState = .connected
            self?.generateMockData()
            
            // Generate data every 2 seconds
            self?.timer = Timer.scheduledTimer(withTimeInterval: 2.0, repeats: true) { [weak self] _ in
                self?.generateMockData()
            }
        }
    }
    
    func stopMonitoring() {
        timer?.invalidate()
        timer = nil
        connectionState = .disconnected
    }
    
    func fetchHistory(limit: Int) async throws -> [BreathingData] {
        // Simulate network delay
        try await Task.sleep(nanoseconds: 500_000_000)
        return BreathingData.mockHistory
    }
    
    /// Toggle apnea simulation for testing alerts
    func simulateApnea(_ enabled: Bool) {
        apneaSimulationEnabled = enabled
        if enabled {
            generateMockData()
        }
    }
    
    private func generateMockData() {
        if apneaSimulationEnabled {
            latestData = BreathingData.mockApnea
        } else {
            latestData = BreathingData(
                timestamp: Date().timeIntervalSince1970,
                breathingRate: Int.random(in: 12...18),
                breathIntervalMs: Int.random(in: 3500...5000),
                apneaDetected: false,
                signalQuality: Double.random(in: 0.85...0.98)
            )
        }
    }
}

