import SwiftUI

/// Main entry point for the Breath Tracker app
@main
struct BreathTrackerApp: App {
    
    // MARK: - Services (Dependency Injection)
    
    /// Data service for breathing data
    /// TODO: Switch to PollingService or WebSocketService when backend is ready
    /// For development, MockPollingService provides simulated data
    #if DEBUG
    private let dataService: MockPollingService = MockPollingService()
    #else
    private let dataService: PollingService = PollingService()
    #endif
    
    /// Audio alarm service for apnea alerts
    private let alarmService: AudioAlarmService = AudioAlarmService()
    
    // MARK: - ViewModels
    
    @StateObject private var liveViewModel: LiveBreathingViewModel
    @StateObject private var historyViewModel: HistoryViewModel
    
    // MARK: - Initialization
    
    init() {
        // Create view models with injected dependencies
        #if DEBUG
        let dataService = MockPollingService()
        #else
        let dataService = PollingService()
        #endif
        
        let alarmService = AudioAlarmService()
        
        _liveViewModel = StateObject(wrappedValue: LiveBreathingViewModel(
            dataService: dataService,
            alarmService: alarmService
        ))
        
        _historyViewModel = StateObject(wrappedValue: HistoryViewModel(
            dataService: dataService
        ))
    }
    
    // MARK: - App Body
    
    var body: some Scene {
        WindowGroup {
            MainTabView(
                liveViewModel: liveViewModel,
                historyViewModel: historyViewModel
            )
        }
    }
}

// MARK: - Post-MVP TODOs

/*
 TODO: Post-MVP Enhancements
 
 1. Background Mode Support
    - Enable background audio for alarms
    - Implement background fetch for data
    - Handle app state transitions properly
 
 2. Settings Screen
    - Configurable polling interval
    - Alarm sound selection
    - Alarm volume control
    - Backend URL configuration
 
 3. Onboarding
    - First-launch tutorial
    - Permission requests (notifications, audio)
    - Backend connection setup
 
 4. Error Handling
    - Network error recovery UI
    - Retry mechanisms with user feedback
    - Offline mode indicator
 
 5. Data Persistence
    - Local caching of history data
    - Offline-first architecture
    - Sync when connection restored
 
 6. Apple Health Integration
    - Export breathing rate to HealthKit
    - Respiratory rate data type
    - User consent flow
 
 7. Caregiver Features
    - Multiple device monitoring
    - Remote notifications
    - Caregiver dashboard
 
 8. Analytics & Insights
    - Daily/weekly breathing summaries
    - Trend visualization
    - Sleep quality correlation
 */

