// @last_updated=2026-11-02T17:33:10.1446661Z
using System.IO;
// #OBSERVACOES# @owner=hermes-visual-computer-use @doc_ref=../references/technical.md
using System.Text.Json;
using System.Windows;
using System.Windows.Threading;
namespace HermesVisual;
public sealed class Host : IDisposable {
 public string State{get;private set;}="IDLE";
 Mutex? writer; bool ownsWriter; MonitorInfo? active; Overlay? overlay; Capture? capture; readonly VisualConfig config;
 readonly DispatcherTimer timer=new(){Interval=TimeSpan.FromSeconds(1)};
 DateTime deadline;string? geometry;
 public Host(VisualConfig c){config=c;c.Validate();timer.Tick+=(_,_)=>{
  if(State=="IDLE" || State=="ERROR")return;
  var current=Native.Monitors(config.monitorBindings);
  if(DateTime.UtcNow>deadline || Signature(current)!=geometry)Stop();
 };}
 static string Signature(List<MonitorInfo> m)=>string.Join("|",m.Select(x=>$"{x.Device}:{x.X}:{x.Y}:{x.Width}:{x.Height}:{x.DpiScale}"));
 public object Status()=>new{state=State,monitor=active,captureActive=capture!=null,overlayVisible=overlay?.IsVisible??false,
  overlayExcluded=overlay?.ExcludedFromCapture??false,backend="Windows.Graphics.Capture"};
 public void Stop(){
  State="STOPPING";timer.Stop();capture?.Dispose();capture=null;overlay?.Close();overlay=null;active=null;if(ownsWriter){writer!.ReleaseMutex();ownsWriter=false;}writer?.Dispose();writer=null;State="IDLE";
 }
 public async Task<object> Dispatch(JsonElement req){
  string op=req.GetProperty("operation").GetString()??"";
  if(op=="test_monitor_models"){
   var results=new List<object>();
   for(int count=1;count<=4;count++){
    var sample=Enumerable.Range(1,count).Select(i=>new MonitorInfo(i,"test-"+i,i,-1920*i,0,1920,1080,i%2==0?1.5:1,i==1)).ToList();
    var mapped=Native.Bind(sample);
    if(mapped.Count!=count || mapped.Count(x=>x.Primary)!=1 || mapped.Any(x=>x.Width!=1920))throw new Exception("MODEL_TEST_FAILED");
    results.Add(new{count,passed=true,kind="synthetic_monitor_records_not_hardware"});
   }
   return new{results};
  }  if(op=="list_monitors")return new{monitors=Native.Monitors(config.monitorBindings)};
  if(op=="get_active_monitor" || op=="get_capture_status")return Status();
  if(op=="hide_overlay" || op=="stop"){Stop();return Status();}
  if(op=="pause"){capture?.Dispose();capture=null;State="PAUSED";overlay?.Present("PAUSADO");return Status();}
  if(op=="capturing"){if(capture==null)throw new InvalidOperationException("NO_CAPTURE_SESSION");State="CAPTURING";overlay?.Present("CAPTURA ATIVA");return Status();} if(op=="automating"){
   if(capture==null)throw new InvalidOperationException("NO_CAPTURE_SESSION");
   State="AUTOMATING";overlay?.Present("AUTOMACAO ATIVA");return Status();
  }
  if(op!="show_overlay" && op!="capture_monitor")throw new ArgumentException("UNKNOWN_OPERATION");
  var monitors=Native.Monitors(config.monitorBindings);int number=req.GetProperty("monitor").GetInt32();
  var m=monitors.SingleOrDefault(x=>x.Number==number)??throw new ArgumentException("MONITOR_NOT_CONNECTED");
  Stop();writer=new Mutex(false,"Local\\CentralDark.HermesVisual."+m.Handle);try{ownsWriter=writer.WaitOne(0);}catch(AbandonedMutexException){ownsWriter=true;}if(!ownsWriter)throw new InvalidOperationException("MONITOR_OWNED_BY_ANOTHER_SESSION");active=m;geometry=Signature(monitors);
  int seconds=req.TryGetProperty("leaseSeconds",out var l)?l.GetInt32():30;
  if(seconds<1||seconds>120)throw new ArgumentException("LEASE_OUT_OF_RANGE");
  deadline=DateTime.UtcNow.AddSeconds(seconds);timer.Start();
  State="INITIALIZING";
  if(config.enabled && config.customOverlay){overlay=new Overlay(m,config);overlay.Present("INICIALIZANDO");}
  if(op=="show_overlay"){overlay?.Present("PREVIA DO ALVO");return Status();}
  if(!req.TryGetProperty("authorized",out var auth)||auth.ValueKind!=JsonValueKind.True){
   Stop();throw new UnauthorizedAccessException("EXPLICIT_CAPTURE_AUTHORIZATION_REQUIRED");
  }
  string output=req.TryGetProperty("output",out var path)?path.GetString()!:
   Path.Combine(Path.GetTempPath(),"hermes-visual-"+Guid.NewGuid().ToString("N")+".png");
  output=Path.GetFullPath(output);
  if(Path.GetExtension(output).ToLowerInvariant()!=".png")throw new ArgumentException("PNG_REQUIRED");
  if(File.Exists(output))throw new IOException("REFUSE_OVERWRITE");
  bool keep=req.TryGetProperty("keepActive",out var k)&&k.ValueKind==JsonValueKind.True;
  try{
   Directory.CreateDirectory(Path.GetDirectoryName(output)!);File.WriteAllBytes(output,Array.Empty<byte>());
   capture=new Capture(m);State="CAPTURING";overlay?.Present("CAPTURA ATIVA");
   var image=await capture.Save(output);
   if(Signature(Native.Monitors(config.monitorBindings))!=geometry)throw new IOException("DISPLAY_CHANGED");
   var result=new{image,monitor=m,state=State,overlayExcluded=overlay?.ExcludedFromCapture??false,
    activeUntil=keep?deadline:(DateTime?)null,retention="caller deletes temporary image after inspection"};
   if(!keep)Stop();return result;
  }catch{if(File.Exists(output))File.Delete(output);Stop();State="ERROR";throw;}
 }
 public void Fail(){Stop();State="ERROR";} public void Dispose()=>Stop();
}
public static class Program {
 [STAThread] public static void Main(string[] args){
  var cfg=new VisualConfig();
  if(args.Length==2 && args[0]=="--config")cfg=JsonSerializer.Deserialize<VisualConfig>(File.ReadAllText(args[1]))!;
  var app=new Application{ShutdownMode=ShutdownMode.OnExplicitShutdown};using var host=new Host(cfg);
  app.Startup+=(_,_)=>Task.Run(async()=>{
   string? line;
   while((line=Console.ReadLine())!=null){
    try{
     using var doc=JsonDocument.Parse(line);
     var req=doc.RootElement.Clone();
     var task=app.Dispatcher.InvokeAsync(()=>host.Dispatch(req));
     var result=await(await task);
     Console.WriteLine(JsonSerializer.Serialize(new{ok=true,result}));
    }catch(Exception e){
     await app.Dispatcher.InvokeAsync(()=>host.Fail());
     Console.WriteLine(JsonSerializer.Serialize(new{ok=false,error=e.GetType().Name,message=e.Message}));
    }
   }
   await app.Dispatcher.InvokeAsync(()=>{host.Stop();app.Shutdown();});
  });
  app.Run();
 }
}