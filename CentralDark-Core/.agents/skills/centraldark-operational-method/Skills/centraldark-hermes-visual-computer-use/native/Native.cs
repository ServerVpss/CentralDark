// @last_updated=2026-11-02T17:33:10.1446661Z
// #OBSERVACOES# @owner=centraldark-hermes-visual-computer-use @doc_ref=../references/technical.md
// @implementado=EnumDisplayMonitors, DPI, WGC monitor interop; no input injection.
using System.Runtime.InteropServices;
using Windows.Graphics.Capture;
using Windows.Graphics.DirectX.Direct3D11;
using WinRT;
namespace HermesVisual;
public record MonitorInfo(int Number,string Device,long Handle,int X,int Y,int Width,int Height,
                          double DpiScale,bool Primary,bool Connected=true);
public static class Native {
 [StructLayout(LayoutKind.Sequential)] public struct RECT { public int Left,Top,Right,Bottom; }
 [StructLayout(LayoutKind.Sequential,CharSet=CharSet.Unicode)] public struct INFO {
  public int Size;public RECT Monitor,Work;public uint Flags;
  [MarshalAs(UnmanagedType.ByValTStr,SizeConst=32)] public string Device;
 }
 public delegate bool EnumProc(IntPtr h,IntPtr dc,ref RECT r,IntPtr data);
 [DllImport("user32.dll")] static extern bool EnumDisplayMonitors(IntPtr a,IntPtr b,EnumProc p,IntPtr d);
 [DllImport("user32.dll",CharSet=CharSet.Unicode)] static extern bool GetMonitorInfo(IntPtr h,ref INFO i);
 [DllImport("shcore.dll")] static extern int GetDpiForMonitor(IntPtr h,int type,out uint x,out uint y);
 [DllImport("user32.dll")] public static extern bool SetWindowDisplayAffinity(IntPtr h,uint affinity);
 [DllImport("user32.dll")] public static extern int GetWindowLong(IntPtr h,int index);
 [DllImport("user32.dll")] public static extern int SetWindowLong(IntPtr h,int index,int value);
 [DllImport("user32.dll")] public static extern bool SetWindowPos(IntPtr h,IntPtr after,int x,int y,int w,int t,uint flags);
 [DllImport("d3d11.dll")] static extern int D3D11CreateDevice(IntPtr adapter,int driver,IntPtr software,uint flags,
  IntPtr levels,uint count,uint sdk,out IntPtr device,out int feature,out IntPtr context);
 [DllImport("d3d11.dll")] static extern int CreateDirect3D11DeviceFromDXGIDevice(IntPtr dxgi,out IntPtr device);
 [DllImport("combase.dll",CharSet=CharSet.Unicode)] static extern int WindowsCreateString(string s,int length,out IntPtr h);
 [DllImport("combase.dll")] static extern int WindowsDeleteString(IntPtr h);
 [DllImport("combase.dll")] static extern int RoGetActivationFactory(IntPtr h,ref Guid iid,out IntPtr factory);
 [ComImport,Guid("3628E81B-3CAC-4C60-B7F4-23CE0E0C3356"),InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
 interface ItemInterop {
  IntPtr CreateForWindow(IntPtr hwnd,ref Guid iid);
  IntPtr CreateForMonitor(IntPtr monitor,ref Guid iid);
 }
 public static List<MonitorInfo> Monitors(Dictionary<string,int>? binding=null) {
  var found=new List<MonitorInfo>();
  EnumProc callback=(IntPtr h,IntPtr dc,ref RECT r,IntPtr d)=>{
   var i=new INFO{Size=Marshal.SizeOf<INFO>(),Device=""};
   if(!GetMonitorInfo(h,ref i))throw new System.ComponentModel.Win32Exception();
   uint dx=96,dy=96; GetDpiForMonitor(h,0,out dx,out dy);
   found.Add(new MonitorInfo(found.Count+1,i.Device,h.ToInt64(),i.Monitor.Left,i.Monitor.Top,
     i.Monitor.Right-i.Monitor.Left,i.Monitor.Bottom-i.Monitor.Top,dx/96.0,(i.Flags&1)!=0));
   return true;
  };
  if(!EnumDisplayMonitors(IntPtr.Zero,IntPtr.Zero,callback,IntPtr.Zero))throw new System.ComponentModel.Win32Exception();
  return Bind(found,binding); } public static List<MonitorInfo> Bind(List<MonitorInfo> found,Dictionary<string,int>? binding=null){ if(binding!=null && binding.Count>0 && found.All(m=>binding.ContainsKey(m.Device)) &&
     found.Select(m=>binding[m.Device]).Distinct().Count()==found.Count)
   found=found.Select(m=>m with{Number=binding[m.Device]}).ToList();
  return found.OrderBy(m=>m.Number).ToList();
 }
 public static GraphicsCaptureItem CaptureItem(long monitor) {
  const string name="Windows.Graphics.Capture.GraphicsCaptureItem";
  Marshal.ThrowExceptionForHR(WindowsCreateString(name,name.Length,out var hs));
  IntPtr factory=IntPtr.Zero,item=IntPtr.Zero;
  try{
   var iid=new Guid("3628E81B-3CAC-4C60-B7F4-23CE0E0C3356");
   Marshal.ThrowExceptionForHR(RoGetActivationFactory(hs,ref iid,out factory));
   var interop=(ItemInterop)Marshal.GetObjectForIUnknown(factory);
   var itemId=new Guid("79C3F95B-31F7-4EC2-A464-632EF5D30760");
   item=interop.CreateForMonitor(new IntPtr(monitor),ref itemId);
   return MarshalInterface<GraphicsCaptureItem>.FromAbi(item);
  }finally{if(item!=IntPtr.Zero)Marshal.Release(item);if(factory!=IntPtr.Zero)Marshal.Release(factory);WindowsDeleteString(hs);}
 }
 public static IDirect3DDevice Device(){
  Marshal.ThrowExceptionForHR(D3D11CreateDevice(IntPtr.Zero,1,IntPtr.Zero,0x20,IntPtr.Zero,0,7,out var dev,out _,out var ctx));
  IntPtr dxgi=IntPtr.Zero,winrt=IntPtr.Zero;
  try{
   var iid=new Guid("54ec77fa-1377-44e6-8c32-88fd5f44c84c");
   Marshal.ThrowExceptionForHR(Marshal.QueryInterface(dev,ref iid,out dxgi));
   Marshal.ThrowExceptionForHR(CreateDirect3D11DeviceFromDXGIDevice(dxgi,out winrt));
   return MarshalInterface<IDirect3DDevice>.FromAbi(winrt);
  }finally{if(ctx!=IntPtr.Zero)Marshal.Release(ctx);Marshal.Release(dev);
   if(dxgi!=IntPtr.Zero)Marshal.Release(dxgi);if(winrt!=IntPtr.Zero)Marshal.Release(winrt);}
 }
}
