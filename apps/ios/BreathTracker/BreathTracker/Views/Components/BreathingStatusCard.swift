import SwiftUI

/// Visual status indicator for breathing state
enum BreathingStatus {
    case normal
    case warning
    case critical
    
    var color: Color {
        switch self {
        case .normal:
            return Theme.statusNormal
        case .warning:
            return Theme.statusWarning
        case .critical:
            return Theme.statusCritical
        }
    }
    
    var icon: String {
        switch self {
        case .normal:
            return "checkmark.circle.fill"
        case .warning:
            return "exclamationmark.triangle.fill"
        case .critical:
            return "xmark.octagon.fill"
        }
    }
    
    var label: String {
        switch self {
        case .normal:
            return "Normal"
        case .warning:
            return "Warning"
        case .critical:
            return "Critical"
        }
    }
}

/// Card component displaying the current breathing status
struct BreathingStatusCard: View {
    let breathingRate: Int
    let status: BreathingStatus
    let signalQuality: Double
    
    var body: some View {
        VStack(spacing: 20) {
            // Status Icon
            ZStack {
                Circle()
                    .fill(status.color.opacity(0.15))
                    .frame(width: 100, height: 100)
                
                Image(systemName: status.icon)
                    .font(.system(size: 50))
                    .foregroundColor(status.color)
            }
            
            // Breathing Rate
            VStack(spacing: 4) {
                Text("\(breathingRate)")
                    .font(.system(size: 72, weight: .bold, design: .rounded))
                    .foregroundColor(status.color)
                
                Text("breaths/min")
                    .font(.subheadline)
                    .foregroundColor(Theme.textSecondary)
            }
            
            // Status Label
            Text(status.label)
                .font(.title2)
                .fontWeight(.semibold)
                .foregroundColor(status.color)
                .padding(.horizontal, 20)
                .padding(.vertical, 8)
                .background(
                    Capsule()
                        .fill(status.color.opacity(0.12))
                )
            
            // Signal Quality Indicator
            SignalQualityView(quality: signalQuality)
        }
        .padding(30)
        .frame(maxWidth: .infinity)
        .background(
            RoundedRectangle(cornerRadius: 24)
                .fill(
                    LinearGradient(
                        colors: [Color.white, Theme.cardBackground],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
                .shadow(color: Theme.primary.opacity(0.25), radius: 15, x: 0, y: 8)
        )
        .overlay(
            RoundedRectangle(cornerRadius: 24)
                .stroke(Theme.primary.opacity(0.3), lineWidth: 1)
        )
    }
}

/// Signal quality indicator view
struct SignalQualityView: View {
    let quality: Double
    
    private var qualityColor: Color {
        if quality >= 0.8 {
            return Theme.statusNormal
        } else if quality >= 0.6 {
            return Theme.statusWarning
        } else {
            return Theme.statusCritical
        }
    }
    
    var body: some View {
        HStack(spacing: 8) {
            Image(systemName: "antenna.radiowaves.left.and.right")
                .foregroundColor(qualityColor)
            
            Text("Signal: \(Int(quality * 100))%")
                .font(.caption)
                .foregroundColor(Theme.textSecondary)
            
            // Signal bars
            HStack(spacing: 2) {
                ForEach(0..<4) { index in
                    RoundedRectangle(cornerRadius: 2)
                        .fill(index < Int(quality * 4) ? qualityColor : Theme.primary.opacity(0.2))
                        .frame(width: 6, height: CGFloat(8 + index * 4))
                }
            }
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 10)
        .background(
            Capsule()
                .fill(Theme.secondaryBackground)
        )
    }
}

// MARK: - Previews

struct BreathingStatusCard_Previews: PreviewProvider {
    static var previews: some View {
        ZStack {
            Theme.backgroundGradient.ignoresSafeArea()
            
            VStack(spacing: 20) {
                BreathingStatusCard(
                    breathingRate: 14,
                    status: .normal,
                    signalQuality: 0.92
                )
                
                BreathingStatusCard(
                    breathingRate: 8,
                    status: .warning,
                    signalQuality: 0.65
                )
            }
            .padding()
        }
    }
}
