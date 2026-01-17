import Foundation

/// App-wide constants and configuration
enum Constants {
    
    // MARK: - API Configuration
    enum API {
        /// Base URL for the backend API
        static let baseURL = "https://breath-tracking-app-production.up.railway.app"
        
        /// API version prefix
        static let apiVersion = "/api/v1"
        
        /// Endpoint for fetching latest breathing data
        static let latestDataEndpoint = "/breathing/latest"
        
        /// Endpoint for fetching historical breathing data
        static let historyEndpoint = "/breathing/history"
        
        /// Full URL for latest data
        static var latestDataURL: URL? {
            URL(string: baseURL + apiVersion + latestDataEndpoint)
        }
        
        /// Full URL for history data
        static var historyURL: URL? {
            URL(string: baseURL + apiVersion + historyEndpoint)
        }
        
        /// Health check URL
        static var healthURL: URL? {
            URL(string: baseURL + apiVersion + "/health")
        }
    }
    
    // MARK: - Polling Configuration
    enum Polling {
        /// Interval between data fetches in seconds
        static let intervalSeconds: TimeInterval = 2.0
        
        /// Timeout for network requests in seconds
        static let requestTimeoutSeconds: TimeInterval = 10.0
    }
    
    // MARK: - WebSocket Configuration
    enum WebSocket {
        /// WebSocket URL for real-time data
        static let url = "wss://breath-tracking-app-production.up.railway.app/ws/v1/breathing"
    }
    
    // MARK: - Alarm Configuration
    enum Alarm {
        /// Name of the alarm sound file (without extension)
        static let soundFileName = "alarm"
        
        /// File extension for the alarm sound
        static let soundFileExtension = "wav"
        
        /// Volume level for the alarm (0.0 to 1.0)
        static let volume: Float = 1.0
    }
    
    // MARK: - UI Configuration
    enum UI {
        /// Threshold for "low" signal quality (below this shows warning)
        static let lowSignalQualityThreshold: Double = 0.7
        
        /// Normal breathing rate range
        static let normalBreathingRateRange = 12...20
    }
}

