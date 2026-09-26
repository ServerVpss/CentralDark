# COMANDO - sdk-mobile.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\catalyst-by-zoho\skills\catalyst-by-zoho\references\sdk-mobile.md
**SHA:** 1bb48104d2331d2e
**Timestamp:** 2026-08-26T18:31:15.572749
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- **AppDelegate:**

### Ouro Bruto (primeiros 5000 chars)
```
# Catalyst Mobile SDKs Reference (Android, iOS, Flutter)

---

## Android SDK (Kotlin) v3

> **Docs:** https://docs.catalyst.zoho.com/en/sdk/android/

### Setup

**Gradle (project-level):**

```groovy
allprojects {
    repositories {
        maven { url "https://maven.zohodl.com" }
    }
}
```

**Gradle (app-level):**

```groovy
dependencies {
    implementation 'com.zoho.catalyst:catalyst-android-sdk:3.+'
}
```

**AndroidManifest.xml permissions:**

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```

**strings.xml — URL scheme:**

```xml
<string name="url_scheme">zc-YOUR_PROJECT_ID</string>
```

**Config file:** Place the downloaded `AppConfigurationData.plist` (or the JSON config file) in `app/src/main/assets/`.

### Init

```kotlin
ZCatalystApp.init(context, ZCatalystEnvironment.DEVELOPMENT)
// For production:
// ZCatalystApp.init(context, ZCatalystEnvironment.PRODUCTION)
```

### Auth

```kotlin
val app = ZCatalystApp.getInstance()

// Sign Up
app.signup(firstName, lastName, email, object : ZCatalystCallback<Void> {
    override fun onSuccess(result: Void?) { /* user registered */ }
    override fun onFailure(exception: ZCatalystException) { /* handle error */ }
})

// Login
app.login(activity, object : ZCatalystCallback<Void> {
    override fun onSuccess(result: Void?) { /* login success */ }
    override fun onFailure(exception: ZCatalystException) { /* handle error */ }
})

// Logout
app.logout(object : ZCatalystCallback<Void> {
    override fun onSuccess(result: Void?) { /* logged out */ }
    override fun onFailure(exception: ZCatalystException) { /* handle error */ }
})

// Get Current User
app.getCurrentUser(object : ZCatalystCallback<ZCatalystUser> {
    override fun onSuccess(user: ZCatalystUser) {
        val email = user.emailId
        val name = user.firstName
    }
    override fun onFailure(exception: ZCatalystException) { /* handle error */ }
})

// Check if user is signed in
val signedIn = app.isUserSignedIn()
```

### Data Store

```kotlin
val dataStore = ZCatalystApp.getInstance().getDataStoreInstance()

// Create rows
val row = ZCatalystRow()
row.setColumnValue("Name", "Alice")
row.setColumnValue("Age", 30)
dataStore.getTableInstance("Users").createRows(listOf(row), object : ZCatalystCallback<List<ZCatalystRow>> {
    override fun onSuccess(rows: List<ZCatalystRow>) { /* created */ }
    override fun onFailure(exception: ZCatalystException) { /* handle error */ }
})

// Get rows
dataStore.getTableInstance("Users").getRows(object : ZCatalystCallback<List<ZCatalystRow>> {
    override fun onSuccess(rows: List<ZCatalystRow>) {
        for (row in rows) {
            val name = row.getColumnValue("Name")
        }
    }
    override fun onFailure(exception: ZCatalystException) { /* handle error */ }
})

// Update rows
row.setColumnValue("ROWID", "12345")
row.setColumnValue("Age", 31)
dataStore.getTableInstance("Users").updateRows(listOf(row), object : ZCatalystCallback<List<ZCatalystRow>> {
    override fun onSuccess(rows: List<ZCatalystRow>) { /* updated */ }
    override fun onFailure(exception: ZCatalystException) { /* handle error */ }
})

// Delete a row
dataStore.getTableInstance("Users").deleteRow("12345", object : ZCatalystCallback<Void> {
    override fun onSuccess(result: Void?) { /* deleted */ }
    override fun onFailure(exception: ZCatalystException) { /* handle error */ }
})
```

### ZCQL

```kotlin
val zcql = ZCatalystApp.getInstance().getZCQLInstance()
zcql.executeQuery("SELECT * FROM Users WHERE Age > 25", object : ZCatalystCallback<List<Map<String, Any>>> {
    override fun onSuccess(rows: List<Map<String, Any>>) { /* process results */ }
    override fun onFailure(exception: ZCatalystException) { /* handle error */ }
})
```

### File Store

```kotlin
val fileStore = ZCatalystApp.getInstance().getFileStoreInstance()

// Get folders
fileStore.getFolders(object : ZCatalystCallback<List<ZCatalystFolder>> {
    override fun onSuccess(folders: List<ZCatalystFolder>) { /* list folders */ }
    override fun onFailure(exception: ZCatalystException) { /* handle error */ }
})

// Upload file
val folder = fileStore.getFolderInstance("folderId")
folder.uploadFile(file, object : ZCatalystCallback<ZCatalystFile> {
    override fun onSuccess(uploadedFile: ZCatalystFile) { /* uploaded */ }
    override fun onFailure(exception: ZCatalystException) { /* handle error */ }
})

// Download file
folder.downloadFile("fileId", object : ZCatalystCallback<InputStream> {
    override fun onSuccess(stream: InputStream) { /* read stream */ }
    override fun onFailure(exception: ZCatalystException) { /* handle error */ }
})

// Delete file
folder.deleteFile("fileId", object : ZCatalystCallback<Void> {
    override fun onSuccess(result: Void?) { /* deleted */ }
    override fun onFailure(exception: ZCatalystException) { /* handle error */ }
})
```

### Search

```kotlin
val search = ZCatalystApp.getInst
```