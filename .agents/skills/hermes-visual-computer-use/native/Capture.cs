// @last_updated=2026-11-02T17:33:10.1446661Z
using System.IO;
// #OBSERVACOES# @owner=hermes-visual-computer-use @doc_ref=../references/technical.md
using Windows.Foundation.Metadata;
using Windows.Graphics.Capture;
using Windows.Graphics.DirectX;
using Windows.Graphics.DirectX.Direct3D11;
using Windows.Graphics.Imaging;
using Windows.Storage;
namespace HermesVisual;
public sealed class Capture : IDisposable {
 GraphicsCaptureItem? item; IDirect3DDevice? device;
 Direct3D11CaptureFramePool? pool; GraphicsCaptureSession? session;
 readonly TaskCompletionSource<SoftwareBitmap> first=new(TaskCreationOptions.RunContinuationsAsynchronously);
 int received; bool disposed;
 public bool BorderSupported{get;}
 public Capture(MonitorInfo monitor) { try {
  if(!GraphicsCaptureSession.IsSupported())throw new NotSupportedException("WGC_NOT_SUPPORTED");
  item=Native.CaptureItem(monitor.Handle);device=Native.Device();
  pool=Direct3D11CaptureFramePool.CreateFreeThreaded(device,DirectXPixelFormat.B8G8R8A8UIntNormalized,2,item.Size);
  session=pool.CreateCaptureSession(item);
  BorderSupported=ApiInformation.IsPropertyPresent("Windows.Graphics.Capture.GraphicsCaptureSession","IsBorderRequired");
  if(BorderSupported)session.IsBorderRequired=true;
  session.IsCursorCaptureEnabled=true;
  item.Closed+=Closed;pool.FrameArrived+=Arrived; }catch{Dispose();throw;}
 }
 void Closed(GraphicsCaptureItem sender,object args)=>first.TrySetException(new IOException("MONITOR_DISCONNECTED"));
 async void Arrived(Direct3D11CaptureFramePool sender,object args){
  if(disposed)return;
  try{
   using var frame=sender.TryGetNextFrame();
   if(frame==null)return;
   if(frame.ContentSize.Width!=item!.Size.Width || frame.ContentSize.Height!=item.Size.Height)
    throw new IOException("DISPLAY_SIZE_CHANGED");
   if(Interlocked.Exchange(ref received,1)!=0)return;
   var bitmap=await SoftwareBitmap.CreateCopyFromSurfaceAsync(frame.Surface);
   if(!first.TrySetResult(bitmap))bitmap.Dispose();
  }catch(Exception e){first.TrySetException(e);}
 }
 public async Task<object> Save(string output){
  session!.StartCapture();
  using var bitmap=await first.Task.WaitAsync(TimeSpan.FromSeconds(10));
  var file=await StorageFile.GetFileFromPathAsync(Path.GetFullPath(output));
  using var stream=await file.OpenAsync(FileAccessMode.ReadWrite);
  var encoder=await BitmapEncoder.CreateAsync(BitmapEncoder.PngEncoderId,stream);
  encoder.SetSoftwareBitmap(bitmap);await encoder.FlushAsync();
  return new{width=bitmap.PixelWidth,height=bitmap.PixelHeight,backend="Windows.Graphics.Capture",
   nativeBorderRequired=BorderSupported,path=output};
 }
 public void Dispose(){
  if(disposed)return;disposed=true;
  if(pool!=null)pool.FrameArrived-=Arrived;if(item!=null)item.Closed-=Closed;session?.Dispose();pool?.Dispose();device?.Dispose();
  first.TrySetCanceled();
 }
}