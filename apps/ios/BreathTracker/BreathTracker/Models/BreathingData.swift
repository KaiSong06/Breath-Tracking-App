import Foundation

/// Represents a single breathing data point from the backend
struct BreathingData: Codable, Identifiable {
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
    
    /// Signal quality from 0.0 to 1.0
    let signalQuality: Double
    
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
    
    /// Signal quality as a percentage string
    var signalQualityPercent: String {
        "\(Int(signalQuality * 100))%"
    }
    
    // Custom decoding to handle backend format (id may not be present)
    enum CodingKeys: String, CodingKey {
        case id
        case timestamp
        case breathingRate
        case breathIntervalMs
        case apneaDetected
        case signalQuality
    }
    
    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        
        // Generate UUID if not provided by backend
        self.id = (try? container.decode(UUID.self, forKey: .id)) ?? UUID()
        self.timestamp = try container.decode(TimeInterval.self, forKey: .timestamp)
        self.breathingRate = try container.decode(Int.self, forKey: .breathingRate)
        self.breathIntervalMs = try container.decode(Int.self, forKey: .breathIntervalMs)
        self.apneaDetected = try container.decode(Bool.self, forKey: .apneaDetected)
        self.signalQuality = try container.decode(Double.self, forKey: .signalQuality)
    }
    
    init(id: UUID = UUID(), timestamp: TimeInterval, breathingRate: Int, breathIntervalMs: Int, apneaDetected: Bool, signalQuality: Double) {
        self.id = id
        self.timestamp = timestamp
        self.breathingRate = breathingRate
        self.breathIntervalMs = breathIntervalMs
        self.apneaDetected = apneaDetected
        self.signalQuality = signalQuality
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
            signalQuality: 0.92
        )
    }
    
    static var mockApnea: BreathingData {
        BreathingData(
            timestamp: Date().timeIntervalSince1970,
            breathingRate: 0,
            breathIntervalMs: 0,
            apneaDetected: true,
            signalQuality: 0.85
        )
    }
    
    static var mockHistory: [BreathingData] {
        (0..<10).map { i in
            BreathingData(
                timestamp: Date().timeIntervalSince1970 - Double(i * 60),
                breathingRate: Int.random(in: 12...18),
                breathIntervalMs: Int.random(in: 3500...5000),
                apneaDetected: false,
                signalQuality: Double.random(in: 0.85...0.98)
            )
        }
    }
}

