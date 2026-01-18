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
    let breathDepth: Int
    
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
            
            // Breath Depth Indicator
            BreathDepthView(depth: breathDepth)
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

/// Breath depth indicator view
struct BreathDepthView: View {
    let depth: Int
    
    private var category: BreathDepthCategory {
        BreathDepthCategory.from(adcValue: depth)
    }
    
    private var depthColor: Color {
        switch category {
        case .shallow:
            return Theme.statusWarning
        case .normal:
            return Theme.statusNormal
        case .deep:
            return Theme.primary
        }
    }
    
    private var icon: String {
        switch category {
        case .shallow:
            return "arrow.down.to.line"
        case .normal:
            return "arrow.up.arrow.down"
        case .deep:
            return "arrow.up.to.line"
        }
    }
    
    var body: some View {
        HStack(spacing: 8) {
            Image(systemName: icon)
                .foregroundColor(depthColor)
            
            Text("Depth: \(category.rawValue)")
                .font(.caption)
                .foregroundColor(Theme.textSecondary)
            
            // Depth bars (3 levels)
            HStack(spacing: 3) {
                ForEach(0..<3) { index in
                    RoundedRectangle(cornerRadius: 2)
                        .fill(index < depthLevel ? depthColor : Theme.primary.opacity(0.2))
                        .frame(width: 8, height: CGFloat(10 + index * 5))
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
    
    private var depthLevel: Int {
        switch category {
        case .shallow: return 1
        case .normal: return 2
        case .deep: return 3
        }
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
                    breathDepth: 280
                )
                
                BreathingStatusCard(
                    breathingRate: 8,
                    status: .warning,
                    breathDepth: 80
                )
            }
            .padding()
        }
    }
}
