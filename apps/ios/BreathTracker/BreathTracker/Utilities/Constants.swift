import Foundation

/// App-wide constants and configuration
enum Constants {
    
    // MARK: - API Configuration
    enum API {
        /// Base URL for the backend API
        /// TODO: Update with actual backend URL when available
        static let baseURL = "https://api.example.com"
        
        /// Endpoint for fetching latest breathing data
        static let latestDataEndpoint = "/breathing/latest"
        
        /// Endpoint for fetching historical breathing data
        static let historyEndpoint = "/breathing/history"
        
        /// Full URL for latest data
        static var latestDataURL: URL? {
            URL(string: baseURL + latestDataEndpoint)
        }
        
        /// Full URL for history data
        static var historyURL: URL? {
            URL(string: baseURL + historyEndpoint)
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
        /// TODO: Update with actual WebSocket URL when available
        static let url = "wss://api.example.com/breathing/stream"
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

