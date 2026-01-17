import SwiftUI

/// Main view for live breathing monitoring
struct LiveBreathingView: View {
    @ObservedObject var viewModel: LiveBreathingViewModel
    
    var body: some View {
        NavigationView {
            ZStack {
                // Pastel Pink Background
                Theme.backgroundGradient
                    .ignoresSafeArea()
                
                // Main Content
                ScrollView {
                    VStack(spacing: 24) {
                        // Connection Status
                        connectionStatusBar
                        
                        // Alert Banner (shown when apnea detected)
                        if viewModel.isAlertActive {
                            AlertBanner(onDismiss: viewModel.dismissAlarm)
                                .transition(.move(edge: .top).combined(with: .opacity))
                                .padding(.horizontal)
                        }
                        
                        // Main Status Card
                        BreathingStatusCard(
                            breathingRate: viewModel.displayBreathingRate,
                            status: viewModel.breathingStatus,
                            signalQuality: viewModel.displaySignalQuality
                        )
                        .padding(.horizontal)
                        
                        // Last Update Time
                        lastUpdateSection
                        
                        // Debug Controls (for development)
                        #if DEBUG
                        debugSection
                        #endif
                        
                        Spacer(minLength: 100)
                    }
                    .padding(.top)
                }
            }
            .navigationTitle("Breath Monitor")
            .navigationBarTitleDisplayMode(.large)
            .toolbarBackground(Theme.backgroundGradientTop.opacity(0.8), for: .navigationBar)
            .onAppear {
                viewModel.startMonitoring()
            }
            .onDisappear {
                viewModel.stopMonitoring()
            }
            .animation(.easeInOut(duration: 0.3), value: viewModel.isAlertActive)
        }
    }
    
    // MARK: - View Components
    
    private var connectionStatusBar: some View {
        HStack(spacing: 8) {
            Circle()
                .fill(connectionStatusColor)
                .frame(width: 8, height: 8)
            
            Text(viewModel.connectionState.statusText)
                .font(.caption)
                .foregroundColor(Theme.textSecondary)
            
            Spacer()
            
            if viewModel.isAlarmPlaying {
                HStack(spacing: 4) {
                    Image(systemName: "speaker.wave.3.fill")
                        .foregroundColor(.red)
                    Text("Alarm Active")
                        .font(.caption)
                        .foregroundColor(.red)
                }
            }
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 10)
        .background(
            Capsule()
                .fill(Color.white.opacity(0.7))
        )
        .padding(.horizontal)
    }
    
    private var connectionStatusColor: Color {
        switch viewModel.connectionState {
        case .connected:
            return Theme.statusNormal
        case .connecting:
            return Theme.statusWarning
        case .disconnected:
            return .gray
        case .error:
            return Theme.statusCritical
        }
    }
    
    private var lastUpdateSection: some View {
        VStack(spacing: 4) {
            Text("Last Update")
                .font(.caption)
                .foregroundColor(Theme.textSecondary)
            
            Text(viewModel.lastUpdateTime)
                .font(.subheadline)
                .fontWeight(.medium)
                .foregroundColor(Theme.textPrimary)
        }
        .padding()
        .background(
            RoundedRectangle(cornerRadius: 12)
                .fill(Color.white.opacity(0.8))
        )
        .padding(.horizontal)
    }
    
    #if DEBUG
    private var debugSection: some View {
        VStack(spacing: 12) {
            Text("Debug Controls")
                .font(.caption)
                .foregroundColor(Theme.textSecondary)
            
            HStack(spacing: 16) {
                Button("Simulate Apnea") {
                    simulateApnea(true)
                }
                .buttonStyle(.bordered)
                .tint(.red)
                
                Button("Normal") {
                    simulateApnea(false)
                }
                .buttonStyle(.bordered)
                .tint(.green)
            }
        }
        .padding()
        .background(
            RoundedRectangle(cornerRadius: 12)
                .fill(Color.white.opacity(0.6))
        )
        .padding(.horizontal)
    }
    
    private func simulateApnea(_ enabled: Bool) {
        // This only works with MockPollingService
        // In production, this section won't be visible
        if let mockService = (viewModel as AnyObject).value(forKey: "dataService") as? MockPollingService {
            mockService.simulateApnea(enabled)
        }
    }
    #endif
}

// MARK: - Preview

struct LiveBreathingView_Previews: PreviewProvider {
    static var previews: some View {
        Group {
            LiveBreathingView(viewModel: .preview)
                .previewDisplayName("Normal")
            
            LiveBreathingView(viewModel: .previewWithApnea)
                .previewDisplayName("Apnea Alert")
        }
    }
}
