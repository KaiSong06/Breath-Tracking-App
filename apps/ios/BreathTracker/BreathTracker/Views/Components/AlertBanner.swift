import SwiftUI

/// Banner displayed when apnea is detected
struct AlertBanner: View {
    let onDismiss: () -> Void
    
    @State private var isAnimating = false
    
    var body: some View {
        VStack(spacing: 16) {
            // Alert Icon with animation
            ZStack {
                Circle()
                    .fill(Color.white.opacity(0.2))
                    .frame(width: 80, height: 80)
                    .scaleEffect(isAnimating ? 1.2 : 1.0)
                
                Image(systemName: "exclamationmark.triangle.fill")
                    .font(.system(size: 40))
                    .foregroundColor(.white)
            }
            .animation(
                .easeInOut(duration: 0.8)
                .repeatForever(autoreverses: true),
                value: isAnimating
            )
            
            // Alert Text
            VStack(spacing: 8) {
                Text("BREATHING STOPPED")
                    .font(.title2)
                    .fontWeight(.bold)
                    .foregroundColor(.white)
                
                Text("Apnea detected - Check patient immediately")
                    .font(.subheadline)
                    .foregroundColor(.white.opacity(0.9))
                    .multilineTextAlignment(.center)
            }
            
            // Dismiss Button
            Button(action: onDismiss) {
                HStack {
                    Image(systemName: "speaker.slash.fill")
                    Text("Dismiss Alarm")
                }
                .font(.headline)
                .foregroundColor(Theme.statusCritical)
                .padding(.horizontal, 24)
                .padding(.vertical, 12)
                .background(
                    Capsule()
                        .fill(Color.white)
                        .shadow(color: .black.opacity(0.1), radius: 4, x: 0, y: 2)
                )
            }
            .padding(.top, 8)
        }
        .padding(24)
        .frame(maxWidth: .infinity)
        .background(
            RoundedRectangle(cornerRadius: 24)
                .fill(
                    LinearGradient(
                        colors: [
                            Theme.statusCritical,
                            Theme.statusCritical.opacity(0.85)
                        ],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
        )
        .overlay(
            RoundedRectangle(cornerRadius: 24)
                .stroke(Color.white.opacity(0.3), lineWidth: 1)
        )
        .shadow(color: Theme.statusCritical.opacity(0.4), radius: 20, x: 0, y: 10)
        .onAppear {
            isAnimating = true
        }
    }
}

/// Compact alert banner for use in navigation or smaller spaces
struct CompactAlertBanner: View {
    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: "exclamationmark.triangle.fill")
                .foregroundColor(.white)
            
            Text("Apnea Detected")
                .font(.subheadline)
                .fontWeight(.semibold)
                .foregroundColor(.white)
            
            Spacer()
            
            Circle()
                .fill(Color.white)
                .frame(width: 8, height: 8)
                .opacity(0.8)
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 10)
        .background(Theme.statusCritical)
    }
}

// MARK: - Previews

struct AlertBanner_Previews: PreviewProvider {
    static var previews: some View {
        ZStack {
            Theme.backgroundGradient.ignoresSafeArea()
            
            VStack(spacing: 30) {
                AlertBanner(onDismiss: {})
                
                CompactAlertBanner()
            }
            .padding()
        }
    }
}
