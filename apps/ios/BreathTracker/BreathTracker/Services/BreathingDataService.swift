import Foundation
import Combine

/// Connection state for the data service
enum ConnectionState: Equatable {
    case disconnected
    case connecting
    case connected
    case error(String)
    
    var isConnected: Bool {
        self == .connected
    }
    
    var statusText: String {
        switch self {
        case .disconnected:
            return "Disconnected"
        case .connecting:
            return "Connecting..."
        case .connected:
            return "Connected"
        case .error(let message):
            return "Error: \(message)"
        }
    }
}

/// Protocol defining the interface for breathing data services
/// Abstracted to allow swapping between polling and WebSocket implementations
protocol BreathingDataService: ObservableObject {
    /// Publisher for the latest breathing data
    var latestDataPublisher: Published<BreathingData?>.Publisher { get }
    
    /// Publisher for the current connection state
    var connectionStatePublisher: Published<ConnectionState>.Publisher { get }
    
    /// The most recent breathing data
    var latestData: BreathingData? { get }
    
    /// Current connection state
    var connectionState: ConnectionState { get }
    
    /// Start monitoring breathing data
    func startMonitoring()
    
    /// Stop monitoring breathing data
    func stopMonitoring()
    
    /// Fetch historical breathing data
    /// - Parameter limit: Maximum number of records to fetch
    /// - Returns: Array of historical breathing data points
    func fetchHistory(limit: Int) async throws -> [BreathingData]
}

/// Errors that can occur during data fetching
enum BreathingDataError: LocalizedError {
    case invalidURL
    case networkError(Error)
    case decodingError(Error)
    case serverError(Int)
    case noData
    
    var errorDescription: String? {
        switch self {
        case .invalidURL:
            return "Invalid API URL configuration"
        case .networkError(let error):
            return "Network error: \(error.localizedDescription)"
        case .decodingError(let error):
            return "Failed to decode response: \(error.localizedDescription)"
        case .serverError(let code):
            return "Server error with code: \(code)"
        case .noData:
            return "No data received from server"
        }
    }
}

