import Foundation

// MARK: - API Response Wrapper

/// Generic wrapper for backend API responses
struct ApiResponse<T: Decodable>: Decodable {
    let success: Bool
    let data: T?
    let timestamp: Int
}

/// Response wrapper specifically for latest breathing data (data can be null)
struct LatestBreathingResponse: Decodable {
    let success: Bool
    let data: BreathingData?
    let timestamp: Int
}

/// Response wrapper for history endpoint
struct HistoryApiResponse: Decodable {
    let success: Bool
    let data: HistoryData
    let timestamp: Int
    
    struct HistoryData: Decodable {
        let samples: [BreathingData]
        let count: Int
        let hasMore: Bool
    }
}

// MARK: - Breath Depth Category

/// Categories for breath depth display
enum BreathDepthCategory: String {
    case shallow = "Shallow"
    case normal = "Normal"
    case deep = "Deep"
    
    /// Get category from ADC amplitude value
    static func from(adcValue: Int) -> BreathDepthCategory {
        if adcValue < 150 {
            return .shallow
        } else if adcValue < 400 {
            return .normal
        } else {
            return .deep
        }
    }
}

// MARK: - Breathing Data Model

/// Represents a single breathing data point from the backend
struct BreathingData: Decodable, Identifiable {
    /// Unique identifier for this data point
    let id: UUID
    
    /// Unix timestamp when this reading was taken
    let timestamp: TimeInterval
    
    /// Breaths per minute
    let breathingRate: Int
    
    /// Time between breaths in milliseconds
    let breathIntervalMs: Int
    
    /// Whether apnea (breathing stopped) was detected
    let apneaDetected: Bool
    
    /// Breath depth in ADC units (0-1023, higher = deeper breaths)
    let breathDepth: Int
    
    /// Computed property to determine if breathing has stopped
    var isBreathingStopped: Bool {
        apneaDetected || breathingRate == 0
    }
    
    /// Formatted timestamp for display
    var formattedTime: String {
        let date = Date(timeIntervalSince1970: timestamp)
        let formatter = DateFormatter()
        formatter.dateStyle = .short
        formatter.timeStyle = .medium
        return formatter.string(from: date)
    }
    
    /// Breath depth as a category (Shallow/Normal/Deep)
    var breathDepthCategory: BreathDepthCategory {
        BreathDepthCategory.from(adcValue: breathDepth)
    }
    
    /// Breath depth display string
    var breathDepthDisplay: String {
        breathDepthCategory.rawValue
    }
    
    // Custom decoding to handle backend format differences
    // Backend uses: breathLengthMs, apneaRisk (string), breathDepth
    // iOS uses: breathIntervalMs, apneaDetected (bool), breathDepth
    enum CodingKeys: String, CodingKey {
        case id
        case timestamp
        case breathingRate
        case breathLengthMs      // Backend field name
        case breathIntervalMs    // Fallback for mock data
        case apneaRisk           // Backend field name (string: "NONE", "LOW", "MEDIUM", "HIGH")
        case apneaDetected       // Fallback for mock data
        case breathDepth
    }
    
    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        
        // Generate UUID if not provided by backend (backend sends string id)
        if let idString = try? container.decode(String.self, forKey: .id),
           let uuid = UUID(uuidString: idString) {
            self.id = uuid
        } else {
            self.id = UUID()
        }
        
        self.timestamp = try container.decode(TimeInterval.self, forKey: .timestamp)
        
        // Handle breathingRate as Int or Double from backend
        if let rate = try? container.decode(Int.self, forKey: .breathingRate) {
            self.breathingRate = rate
        } else if let rateDouble = try? container.decode(Double.self, forKey: .breathingRate) {
            self.breathingRate = Int(rateDouble)
        } else {
            self.breathingRate = 0
        }
        
        // Map breathLengthMs (backend) to breathIntervalMs (iOS)
        if let lengthMs = try? container.decode(Int.self, forKey: .breathLengthMs) {
            self.breathIntervalMs = lengthMs
        } else if let intervalMs = try? container.decode(Int.self, forKey: .breathIntervalMs) {
            self.breathIntervalMs = intervalMs
        } else {
            self.breathIntervalMs = 0
        }
        
        // Convert apneaRisk string to apneaDetected bool
        // HIGH risk = apnea detected
        if let riskString = try? container.decode(String.self, forKey: .apneaRisk) {
            self.apneaDetected = (riskString == "HIGH")
        } else if let detected = try? container.decode(Bool.self, forKey: .apneaDetected) {
            self.apneaDetected = detected
        } else {
            self.apneaDetected = false
        }
        
        // Breath depth as Int or Double
        if let depth = try? container.decode(Int.self, forKey: .breathDepth) {
            self.breathDepth = depth
        } else if let depthDouble = try? container.decode(Double.self, forKey: .breathDepth) {
            self.breathDepth = Int(depthDouble)
        } else {
            self.breathDepth = 0
        }
    }
    
    init(id: UUID = UUID(), timestamp: TimeInterval, breathingRate: Int, breathIntervalMs: Int, apneaDetected: Bool, breathDepth: Int) {
        self.id = id
        self.timestamp = timestamp
        self.breathingRate = breathingRate
        self.breathIntervalMs = breathIntervalMs
        self.apneaDetected = apneaDetected
        self.breathDepth = breathDepth
    }
}

// MARK: - Mock Data for Development
extension BreathingData {
    static var mockNormal: BreathingData {
        BreathingData(
            timestamp: Date().timeIntervalSince1970,
            breathingRate: 14,
            breathIntervalMs: 4300,
            apneaDetected: false,
            breathDepth: 280  // Normal depth
        )
    }
    
    static var mockApnea: BreathingData {
        BreathingData(
            timestamp: Date().timeIntervalSince1970,
            breathingRate: 0,
            breathIntervalMs: 0,
            apneaDetected: true,
            breathDepth: 0  // No breathing
        )
    }
    
    static var mockHistory: [BreathingData] {
        (0..<10).map { i in
            BreathingData(
                timestamp: Date().timeIntervalSince1970 - Double(i * 60),
                breathingRate: Int.random(in: 12...18),
                breathIntervalMs: Int.random(in: 3500...5000),
                apneaDetected: false,
                breathDepth: Int.random(in: 200...400)  // Normal range
            )
        }
    }
}

