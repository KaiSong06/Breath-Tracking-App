import SwiftUI

/// Main tab view containing Live and History tabs
struct MainTabView: View {
    @ObservedObject var liveViewModel: LiveBreathingViewModel
    @ObservedObject var historyViewModel: HistoryViewModel
    
    @State private var selectedTab: Tab = .live
    
    enum Tab {
        case live
        case history
    }
    
    var body: some View {
        TabView(selection: $selectedTab) {
            // Live Monitoring Tab
            LiveBreathingView(viewModel: liveViewModel)
                .tabItem {
                    Label("Live", systemImage: "waveform.path.ecg")
                }
                .tag(Tab.live)
            
            // History Tab
            HistoryView(viewModel: historyViewModel)
                .tabItem {
                    Label("History", systemImage: "clock.arrow.circlepath")
                }
                .tag(Tab.history)
        }
        .tint(tabTintColor)
        // Show alert indicator on tab bar when apnea is active
        .overlay(alignment: .bottom) {
            if liveViewModel.isAlertActive && selectedTab != .live {
                alertIndicator
            }
        }
    }
    
    // MARK: - View Components
    
    /// Dynamic tab tint color based on breathing status
    private var tabTintColor: Color {
        if liveViewModel.isAlertActive {
            return Theme.statusCritical
        }
        return Theme.primaryAccent
    }
    
    /// Indicator shown when user is on History tab but alert is active
    private var alertIndicator: some View {
        Button {
            selectedTab = .live
        } label: {
            HStack(spacing: 8) {
                Image(systemName: "exclamationmark.triangle.fill")
                Text("Alert Active - Tap to View")
                    .font(.caption)
                    .fontWeight(.semibold)
            }
            .foregroundColor(.white)
            .padding(.horizontal, 16)
            .padding(.vertical, 10)
            .background(
                Capsule()
                    .fill(Theme.statusCritical)
            )
            .shadow(color: Theme.statusCritical.opacity(0.4), radius: 8, x: 0, y: 4)
        }
        .padding(.bottom, 60) // Above tab bar
        .transition(.move(edge: .bottom).combined(with: .opacity))
        .animation(.easeInOut(duration: 0.3), value: liveViewModel.isAlertActive)
    }
}

// MARK: - Preview

struct MainTabView_Previews: PreviewProvider {
    static var previews: some View {
        let mockDataService = MockPollingService()
        let mockAlarmService = MockAudioAlarmService()
        
        MainTabView(
            liveViewModel: LiveBreathingViewModel(
                dataService: mockDataService,
                alarmService: mockAlarmService
            ),
            historyViewModel: HistoryViewModel(dataService: mockDataService)
        )
    }
}
