import Foundation
import Combine

/// ViewModel for the live breathing monitoring view
final class LiveBreathingViewModel: ObservableObject {
    
    // MARK: - Published Properties
    
    /// Current breathing data
    @Published private(set) var currentData: BreathingData?
    
    /// Current connection state
    @Published private(set) var connectionState: ConnectionState = .disconnected
    
    /// Whether an apnea alert is active
    @Published private(set) var isAlertActive: Bool = false
    
    /// Whether the alarm is currently playing
    @Published private(set) var isAlarmPlaying: Bool = false
    
    /// Whether the user has dismissed the current alarm (resets on new apnea event)
    @Published private var alarmDismissed: Bool = false
    
    // MARK: - Computed Properties
    
    /// Current breathing status for UI display
    var breathingStatus: BreathingStatus {
        guard let data = currentData else {
            return .warning
        }
        
        if data.isBreathingStopped {
            return .critical
        }
        
        if !Constants.UI.normalBreathingRateRange.contains(data.breathingRate) {
            return .warning
        }
        
        if data.signalQuality < Constants.UI.lowSignalQualityThreshold {
            return .warning
        }
        
        return .normal
    }
    
    /// Current breathing rate for display
    var displayBreathingRate: Int {
        currentData?.breathingRate ?? 0
    }
    
    /// Current signal quality for display
    var displaySignalQuality: Double {
        currentData?.signalQuality ?? 0.0
    }
    
    /// Formatted last update time
    var lastUpdateTime: String {
        currentData?.formattedTime ?? "No data"
    }
    
    // MARK: - Dependencies
    
    private let dataService: any BreathingDataService
    private let alarmService: AudioAlarmServiceProtocol
    private var cancellables = Set<AnyCancellable>()
    
    // MARK: - Initialization
    
    init(
        dataService: any BreathingDataService,
        alarmService: AudioAlarmServiceProtocol
    ) {
        self.dataService = dataService
        self.alarmService = alarmService
        
        setupBindings()
    }
    
    // MARK: - Public Methods
    
    /// Start monitoring breathing data
    func startMonitoring() {
        dataService.startMonitoring()
    }
    
    /// Stop monitoring breathing data
    func stopMonitoring() {
        dataService.stopMonitoring()
        stopAlarm()
    }
    
    /// Dismiss the current alarm
    /// Note: Alarm will re-trigger if apnea persists on next data update
    func dismissAlarm() {
        alarmDismissed = true
        stopAlarm()
    }
    
    // MARK: - Private Methods
    
    private func setupBindings() {
        // Subscribe to data updates
        dataService.latestDataPublisher
            .receive(on: DispatchQueue.main)
            .sink { [weak self] data in
                self?.handleDataUpdate(data)
            }
            .store(in: &cancellables)
        
        // Subscribe to connection state
        dataService.connectionStatePublisher
            .receive(on: DispatchQueue.main)
            .assign(to: &$connectionState)
    }
    
    private func handleDataUpdate(_ data: BreathingData?) {
        let previousData = currentData
        currentData = data
        
        guard let data = data else { return }
        
        // Check for apnea
        if data.isBreathingStopped {
            // Apnea detected
            isAlertActive = true
            
            // Only play alarm if not already dismissed for this apnea event
            if !alarmDismissed {
                playAlarm()
            }
        } else {
            // Breathing normal - clear alert and reset dismiss state
            if previousData?.isBreathingStopped == true {
                // Breathing just resumed
                isAlertActive = false
                alarmDismissed = false
                stopAlarm()
            }
        }
    }
    
    private func playAlarm() {
        guard !isAlarmPlaying else { return }
        alarmService.playAlarm()
        isAlarmPlaying = true
    }
    
    private func stopAlarm() {
        alarmService.stopAlarm()
        isAlarmPlaying = false
    }
}

// MARK: - Preview Helper

extension LiveBreathingViewModel {
    /// Create a view model with mock services for previews
    static var preview: LiveBreathingViewModel {
        let mockDataService = MockPollingService()
        let mockAlarmService = MockAudioAlarmService()
        return LiveBreathingViewModel(
            dataService: mockDataService,
            alarmService: mockAlarmService
        )
    }
    
    /// Create a view model showing apnea state for previews
    static var previewWithApnea: LiveBreathingViewModel {
        let mockDataService = MockPollingService()
        let mockAlarmService = MockAudioAlarmService()
        let vm = LiveBreathingViewModel(
            dataService: mockDataService,
            alarmService: mockAlarmService
        )
        mockDataService.simulateApnea(true)
        return vm
    }
}

