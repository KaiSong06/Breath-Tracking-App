import Foundation
import Combine

/// ViewModel for the breathing history view
final class HistoryViewModel: ObservableObject {
    
    // MARK: - Published Properties
    
    /// Historical breathing data
    @Published private(set) var historyData: [BreathingData] = []
    
    /// Loading state
    @Published private(set) var isLoading: Bool = false
    
    /// Error message if fetch failed
    @Published private(set) var errorMessage: String?
    
    // MARK: - Configuration
    
    /// Number of history records to fetch
    private let historyLimit: Int = 50
    
    // MARK: - Dependencies
    
    private let dataService: any BreathingDataService
    private var cancellables = Set<AnyCancellable>()
    
    // MARK: - Initialization
    
    init(dataService: any BreathingDataService) {
        self.dataService = dataService
    }
    
    // MARK: - Public Methods
    
    /// Fetch historical breathing data
    func fetchHistory() {
        guard !isLoading else { return }
        
        isLoading = true
        errorMessage = nil
        
        Task {
            do {
                let history = try await dataService.fetchHistory(limit: historyLimit)
                await MainActor.run {
                    self.historyData = history
                    self.isLoading = false
                }
            } catch {
                await MainActor.run {
                    self.errorMessage = error.localizedDescription
                    self.isLoading = false
                }
            }
        }
    }
    
    /// Refresh history data (for pull-to-refresh)
    func refresh() {
        fetchHistory()
    }
    
    /// Clear any error state
    func clearError() {
        errorMessage = nil
    }
}

// MARK: - History Item Display Helper

extension BreathingData {
    /// Status text for history list display
    var historyStatusText: String {
        if apneaDetected {
            return "⚠️ Apnea Detected"
        } else if breathingRate < 12 {
            return "Low Rate"
        } else if breathingRate > 20 {
            return "High Rate"
        } else {
            return "Normal"
        }
    }
    
    /// Status color name for history list
    var historyStatusColorName: String {
        if apneaDetected {
            return "red"
        } else if breathingRate < 12 || breathingRate > 20 {
            return "orange"
        } else {
            return "green"
        }
    }
}

// MARK: - Preview Helper

extension HistoryViewModel {
    /// Create a view model with mock data for previews
    static var preview: HistoryViewModel {
        let mockService = MockPollingService()
        let vm = HistoryViewModel(dataService: mockService)
        vm.historyData = BreathingData.mockHistory
        return vm
    }
    
    /// Create a view model in loading state for previews
    static var previewLoading: HistoryViewModel {
        let mockService = MockPollingService()
        let vm = HistoryViewModel(dataService: mockService)
        vm.isLoading = true
        return vm
    }
    
    /// Create a view model with error for previews
    static var previewError: HistoryViewModel {
        let mockService = MockPollingService()
        let vm = HistoryViewModel(dataService: mockService)
        vm.errorMessage = "Failed to connect to server"
        return vm
    }
}

