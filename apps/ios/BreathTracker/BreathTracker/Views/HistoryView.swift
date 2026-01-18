import SwiftUI

/// View displaying historical breathing data
struct HistoryView: View {
    @ObservedObject var viewModel: HistoryViewModel
    
    var body: some View {
        NavigationView {
            ZStack {
                // Pastel Pink Background
                Theme.backgroundGradient
                    .ignoresSafeArea()
                
                Group {
                    if viewModel.isLoading && viewModel.historyData.isEmpty {
                        loadingView
                    } else if let error = viewModel.errorMessage {
                        errorView(message: error)
                    } else if viewModel.historyData.isEmpty {
                        emptyView
                    } else {
                        historyList
                    }
                }
            }
            .navigationTitle("History")
            .navigationBarTitleDisplayMode(.large)
            .toolbarBackground(Theme.backgroundGradientTop.opacity(0.8), for: .navigationBar)
            .onAppear {
                if viewModel.historyData.isEmpty {
                    viewModel.fetchHistory()
                }
            }
        }
    }
    
    // MARK: - View Components
    
    private var loadingView: some View {
        VStack(spacing: 16) {
            ProgressView()
                .scaleEffect(1.5)
                .tint(Theme.primaryAccent)
            
            Text("Loading history...")
                .font(.subheadline)
                .foregroundColor(Theme.textSecondary)
        }
        .padding(30)
        .background(
            RoundedRectangle(cornerRadius: 20)
                .fill(Color.white.opacity(0.8))
        )
    }
    
    private func errorView(message: String) -> some View {
        VStack(spacing: 16) {
            Image(systemName: "exclamationmark.triangle.fill")
                .font(.system(size: 50))
                .foregroundColor(Theme.statusWarning)
            
            Text("Unable to Load History")
                .font(.headline)
                .foregroundColor(Theme.textPrimary)
            
            Text(message)
                .font(.subheadline)
                .foregroundColor(Theme.textSecondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal)
            
            Button("Try Again") {
                viewModel.fetchHistory()
            }
            .buttonStyle(.borderedProminent)
            .tint(Theme.primaryAccent)
        }
        .padding(30)
        .background(
            RoundedRectangle(cornerRadius: 20)
                .fill(Color.white.opacity(0.9))
        )
        .padding()
    }
    
    private var emptyView: some View {
        VStack(spacing: 16) {
            Image(systemName: "chart.line.downtrend.xyaxis")
                .font(.system(size: 50))
                .foregroundColor(Theme.primaryAccent)
            
            Text("No History Available")
                .font(.headline)
                .foregroundColor(Theme.textPrimary)
            
            Text("Breathing data will appear here once monitoring begins.")
                .font(.subheadline)
                .foregroundColor(Theme.textSecondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal)
            
            Button("Refresh") {
                viewModel.fetchHistory()
            }
            .buttonStyle(.bordered)
            .tint(Theme.primaryAccent)
        }
        .padding(30)
        .background(
            RoundedRectangle(cornerRadius: 20)
                .fill(Color.white.opacity(0.9))
        )
        .padding()
    }
    
    private var historyList: some View {
        ScrollView {
            LazyVStack(spacing: 12) {
                ForEach(viewModel.historyData) { dataPoint in
                    HistoryRowView(data: dataPoint)
                }
            }
            .padding()
        }
        .refreshable {
            viewModel.refresh()
        }
    }
}

/// Row view for a single history data point
struct HistoryRowView: View {
    let data: BreathingData
    
    var body: some View {
        HStack(spacing: 16) {
            // Status indicator
            Circle()
                .fill(statusColor)
                .frame(width: 12, height: 12)
            
            // Main content
            VStack(alignment: .leading, spacing: 4) {
                HStack {
                    Text("\(data.breathingRate) bpm")
                        .font(.headline)
                        .foregroundColor(Theme.textPrimary)
                    
                    Spacer()
                    
                    Text(data.historyStatusText)
                        .font(.caption)
                        .foregroundColor(statusColor)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 4)
                        .background(
                            Capsule()
                                .fill(statusColor.opacity(0.12))
                        )
                }
                
                HStack {
                    Text(data.formattedTime)
                        .font(.caption)
                        .foregroundColor(Theme.textSecondary)
                    
                    Spacer()
                    
                    Text("Depth: \(data.breathDepthDisplay)")
                        .font(.caption)
                        .foregroundColor(Theme.textSecondary)
                }
            }
        }
        .padding(16)
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(Color.white)
                .shadow(color: Theme.primary.opacity(0.15), radius: 8, x: 0, y: 2)
        )
    }
    
    private var statusColor: Color {
        switch data.historyStatusColorName {
        case "red":
            return Theme.statusCritical
        case "orange":
            return Theme.statusWarning
        default:
            return Theme.statusNormal
        }
    }
}

// MARK: - Preview

struct HistoryView_Previews: PreviewProvider {
    static var previews: some View {
        Group {
            HistoryView(viewModel: .preview)
                .previewDisplayName("With Data")
            
            HistoryView(viewModel: .previewLoading)
                .previewDisplayName("Loading")
            
            HistoryView(viewModel: .previewError)
                .previewDisplayName("Error")
        }
    }
}
