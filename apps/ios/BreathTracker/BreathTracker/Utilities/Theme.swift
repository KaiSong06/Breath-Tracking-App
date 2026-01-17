import SwiftUI

/// App-wide theme colors and styling
enum Theme {
    
    // MARK: - Primary Colors (Pastel Pink)
    
    /// Main pastel pink color
    static let primary = Color(red: 255/255, green: 182/255, blue: 193/255) // Light pink
    
    /// Darker pink for accents
    static let primaryAccent = Color(red: 255/255, green: 145/255, blue: 164/255) // Rose pink
    
    /// Very light pink for backgrounds
    static let primaryLight = Color(red: 255/255, green: 228/255, blue: 235/255) // Blush
    
    /// Soft pink for cards
    static let cardBackground = Color(red: 255/255, green: 240/255, blue: 245/255) // Lavender blush
    
    // MARK: - Background Colors
    
    /// Main background gradient colors
    static let backgroundGradientTop = Color(red: 255/255, green: 218/255, blue: 233/255) // Pink lace
    static let backgroundGradientBottom = Color(red: 255/255, green: 250/255, blue: 252/255) // Almost white
    
    /// Secondary background for sections
    static let secondaryBackground = Color(red: 252/255, green: 235/255, blue: 243/255)
    
    // MARK: - Status Colors (kept for indicators)
    
    static let statusNormal = Color.green
    static let statusWarning = Color.orange
    static let statusCritical = Color.red
    
    // MARK: - Text Colors
    
    static let textPrimary = Color(red: 60/255, green: 60/255, blue: 70/255)
    static let textSecondary = Color(red: 120/255, green: 120/255, blue: 130/255)
    
    // MARK: - Gradients
    
    /// Main background gradient
    static var backgroundGradient: LinearGradient {
        LinearGradient(
            colors: [backgroundGradientTop, backgroundGradientBottom],
            startPoint: .top,
            endPoint: .bottom
        )
    }
    
    /// Card gradient
    static var cardGradient: LinearGradient {
        LinearGradient(
            colors: [cardBackground, Color.white],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
    }
    
    // MARK: - Shadows
    
    static let cardShadowColor = primary.opacity(0.3)
    static let cardShadowRadius: CGFloat = 12
}

// MARK: - View Modifiers

extension View {
    /// Apply the standard card style with pastel pink theme
    func themedCard() -> some View {
        self
            .background(
                RoundedRectangle(cornerRadius: 20)
                    .fill(Theme.cardGradient)
                    .shadow(color: Theme.cardShadowColor, radius: Theme.cardShadowRadius, x: 0, y: 4)
            )
    }
    
    /// Apply pastel pink background
    func themedBackground() -> some View {
        self.background(Theme.backgroundGradient.ignoresSafeArea())
    }
}

