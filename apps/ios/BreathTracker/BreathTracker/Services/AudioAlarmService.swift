import Foundation
import AVFoundation

/// Protocol for audio alarm functionality
protocol AudioAlarmServiceProtocol {
    /// Start playing the alarm sound
    func playAlarm()
    
    /// Stop the alarm sound
    func stopAlarm()
    
    /// Whether the alarm is currently playing
    var isPlaying: Bool { get }
}

/// Service responsible for playing audio alarms when apnea is detected
final class AudioAlarmService: AudioAlarmServiceProtocol, ObservableObject {
    
    // MARK: - Properties
    
    private var audioPlayer: AVAudioPlayer?
    
    @Published private(set) var isPlaying: Bool = false
    
    // MARK: - Initialization
    
    init() {
        configureAudioSession()
    }
    
    // MARK: - Private Methods
    
    /// Configure the audio session for playback
    private func configureAudioSession() {
        do {
            // Use .playback category to ensure sound plays even in silent mode
            try AVAudioSession.sharedInstance().setCategory(
                .playback,
                mode: .default,
                options: [.mixWithOthers]
            )
        } catch {
            print("Failed to configure audio session: \(error.localizedDescription)")
        }
    }
    
    /// Activate the audio session
    private func activateAudioSession() {
        do {
            try AVAudioSession.sharedInstance().setActive(true)
        } catch {
            print("Failed to activate audio session: \(error.localizedDescription)")
        }
    }
    
    // MARK: - AudioAlarmServiceProtocol
    
    func playAlarm() {
        // Don't restart if already playing
        guard !isPlaying else { return }
        
        activateAudioSession()
        
        // Try to load the alarm sound from the bundle
        guard let url = Bundle.main.url(
            forResource: Constants.Alarm.soundFileName,
            withExtension: Constants.Alarm.soundFileExtension
        ) else {
            print("Alarm sound file not found. Using system sound as fallback.")
            playSystemSoundFallback()
            return
        }
        
        do {
            audioPlayer = try AVAudioPlayer(contentsOf: url)
            audioPlayer?.numberOfLoops = -1 // Loop indefinitely
            audioPlayer?.volume = Constants.Alarm.volume
            audioPlayer?.prepareToPlay()
            audioPlayer?.play()
            isPlaying = true
        } catch {
            print("Failed to play alarm: \(error.localizedDescription)")
            playSystemSoundFallback()
        }
    }
    
    func stopAlarm() {
        audioPlayer?.stop()
        audioPlayer = nil
        isPlaying = false
    }
    
    // MARK: - Fallback
    
    /// Play a system sound as fallback if custom alarm file is not available
    private func playSystemSoundFallback() {
        // Use a system sound as fallback
        // This will play once - for continuous alert, we'd need to implement a timer
        AudioServicesPlayAlertSound(SystemSoundID(1005)) // SMS alert sound
        isPlaying = true
        
        // TODO: Implement looping for system sound fallback if needed
        // For MVP, the custom alarm.wav should be provided
    }
}

// MARK: - Preview/Mock Implementation

/// Mock alarm service for SwiftUI previews and testing
final class MockAudioAlarmService: AudioAlarmServiceProtocol, ObservableObject {
    @Published private(set) var isPlaying: Bool = false
    
    func playAlarm() {
        isPlaying = true
        print("[Mock] Alarm started")
    }
    
    func stopAlarm() {
        isPlaying = false
        print("[Mock] Alarm stopped")
    }
}

