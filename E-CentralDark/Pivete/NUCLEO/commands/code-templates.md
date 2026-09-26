# COMANDO - code-templates.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\build-ios-apps\skills\ios-app-intents\references\code-templates.md
**SHA:** 61cbb6f21a9d5086
**Timestamp:** 2026-08-26T18:31:14.873622
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- static let openAppWhenRun = true
- static let openAppWhenRun = false
- static let openAppWhenRun = true
- static let openAppWhenRun = false

### Ouro Bruto (primeiros 5000 chars)
```
# Code templates

These templates are intentionally generic. Rename types and services to fit the app.

## Open-app handoff intent

```swift
import AppIntents

struct OpenComposerIntent: AppIntent {
  static let title: LocalizedStringResource = "Open composer"
  static let description = IntentDescription("Open the app to compose content")
  static let openAppWhenRun = true

  @Parameter(
    title: "Prefilled text",
    inputConnectionBehavior: .connectToPreviousIntentResult
  )
  var text: String?

  func perform() async throws -> some IntentResult {
    await MainActor.run {
      AppIntentRouter.shared.handledIntent = .init(intent: self)
    }
    return .result()
  }
}
```

Scene-side handoff:

```swift
import AppIntents
import Observation

@Observable
final class AppIntentRouter {
  struct HandledIntent: Equatable {
    let id = UUID()
    let intent: any AppIntent

    static func == (lhs: Self, rhs: Self) -> Bool {
      lhs.id == rhs.id
    }
  }

  static let shared = AppIntentRouter()
  var handledIntent: HandledIntent?

  private init() {}
}

private func handleIntent() {
  guard let intent = appIntentRouter.handledIntent?.intent else { return }

  if let composerIntent = intent as? OpenComposerIntent {
    appRouter.presentComposer(prefilledText: composerIntent.text ?? "")
  } else if let sectionIntent = intent as? OpenSectionIntent {
    selectedTab = sectionIntent.section.toTab
  }
}
```

## Inline action intent

```swift
import AppIntents

struct CreateItemIntent: AppIntent {
  static let title: LocalizedStringResource = "Create item"
  static let description = IntentDescription("Create a new item without opening the app")
  static let openAppWhenRun = false

  @Parameter(title: "Title")
  var title: String

  @Parameter(title: "Workspace")
  var workspace: WorkspaceEntity

  func perform() async throws -> some IntentResult & ProvidesDialog {
    do {
      try await ItemService.shared.createItem(title: title, workspaceID: workspace.id)
      return .result(dialog: "Created \(title).")
    } catch {
      return .result(dialog: "Could not create the item. Please try again.")
    }
  }
}
```

## Fixed selection with `AppEnum`

```swift
import AppIntents

enum SectionIntentValue: String, AppEnum {
  case inbox
  case projects
  case settings

  static var typeDisplayName: LocalizedStringResource { "Section" }
  static let typeDisplayRepresentation: TypeDisplayRepresentation = "Section"

  static var caseDisplayRepresentations: [Self: DisplayRepresentation] {
    [
      .inbox: "Inbox",
      .projects: "Projects",
      .settings: "Settings",
    ]
  }

  var toTab: AppTab {
    switch self {
    case .inbox: .inbox
    case .projects: .projects
    case .settings: .settings
    }
  }
}

struct OpenSectionIntent: AppIntent {
  static let title: LocalizedStringResource = "Open section"
  static let openAppWhenRun = true

  @Parameter(title: "Section")
  var section: SectionIntentValue

  func perform() async throws -> some IntentResult {
    await MainActor.run {
      AppIntentRouter.shared.handledIntent = .init(intent: self)
    }
    return .result()
  }
}
```

## Entity and query

```swift
import AppIntents

struct WorkspaceEntity: AppEntity, Identifiable {
  let workspace: Workspace

  var id: String { workspace.id }

  static let typeDisplayRepresentation: TypeDisplayRepresentation = "Workspace"
  static let defaultQuery = WorkspaceQuery()

  var displayRepresentation: DisplayRepresentation {
    DisplayRepresentation(title: "\(workspace.name)")
  }
}

struct WorkspaceQuery: EntityQuery {
  func entities(for identifiers: [WorkspaceEntity.ID]) async throws -> [WorkspaceEntity] {
    let workspaces = try await WorkspaceStore.shared.workspaces(matching: identifiers)
    return workspaces.map(WorkspaceEntity.init)
  }

  func suggestedEntities() async throws -> [WorkspaceEntity] {
    try await WorkspaceStore.shared.recentWorkspaces().map(WorkspaceEntity.init)
  }

  func defaultResult() async -> WorkspaceEntity? {
    guard let workspace = try? await WorkspaceStore.shared.currentWorkspace() else { return nil }
    return WorkspaceEntity(workspace: workspace)
  }
}
```

## Dependent query

```swift
import AppIntents

struct ProjectEntity: AppEntity, Identifiable {
  let project: Project

  var id: String { project.id }

  static let typeDisplayRepresentation: TypeDisplayRepresentation = "Project"
  static let defaultQuery = ProjectQuery()

  var displayRepresentation: DisplayRepresentation {
    DisplayRepresentation(title: "\(project.name)")
  }
}

struct ProjectSelectionIntent: WidgetConfigurationIntent {
  static let title: LocalizedStringResource = "Project widget configuration"

  @Parameter(title: "Workspace")
  var workspace: WorkspaceEntity?

  @Parameter(title: "Project")
  var project: ProjectEntity?
}

struct ProjectQuery: EntityQuery {
  @IntentParameterDependency<ProjectSelectionIntent>(\.$workspace)
  var workspace

  func entities(for identifiers: [ProjectEntity.ID]) async thro
```