// @last_updated=2026-11-02T17:33:10.1446661Z
// #OBSERVACOES# @owner=centraldark-hermes-visual-computer-use @doc_ref=../references/technical.md
using System.Windows;
using System.Windows.Controls;
using System.Windows.Interop;
using System.Windows.Media;
using System.Windows.Media.Animation;
using System.Windows.Media.Effects;
namespace HermesVisual;
public sealed class VisualConfig {
 public bool enabled{get;set;}=true;
 public bool nativeCaptureBorder{get;set;}=true;
 public bool customOverlay{get;set;}=true;
 public double borderThickness{get;set;}=10;
 public string borderColor{get;set;}="#00D889";
 public double opacity{get;set;}=.30;
 public bool shadow{get;set;}=true;
 public double shadowBlur{get;set;}=28;
 public bool roundedCorners{get;set;}=true;
 public bool showMonitorNumber{get;set;}=true;
 public bool showAgentStatus{get;set;}=true;
 public bool animateActivation{get;set;}=true;
 public bool clickThrough{get;set;}=true;
 public Dictionary<string,int> monitorBindings{get;set;}=new();
 public void Validate(){
  if(!nativeCaptureBorder || !clickThrough)throw new ArgumentException("Native border and click-through must remain enabled.");
  if(borderThickness<1 || borderThickness>40 || opacity<.05 || opacity>1 || shadowBlur<0 || shadowBlur>80)
   throw new ArgumentException("CONFIG_OUT_OF_RANGE");
  _=ColorConverter.ConvertFromString(borderColor);
 }
}
public sealed class Overlay : Window {
 readonly TextBlock label=new(); readonly MonitorInfo monitor; readonly VisualConfig cfg;
 public bool ExcludedFromCapture{get;private set;}
 public Overlay(MonitorInfo m,VisualConfig config){
  monitor=m;cfg=config;cfg.Validate();
  WindowStyle=WindowStyle.None;ResizeMode=ResizeMode.NoResize;AllowsTransparency=true;
  Background=Brushes.Transparent;ShowActivated=false;Focusable=false;IsHitTestVisible=false;
  ShowInTaskbar=false;Topmost=true;WindowStartupLocation=WindowStartupLocation.Manual;
  Left=m.X/m.DpiScale;Top=m.Y/m.DpiScale;Width=m.Width/m.DpiScale;Height=m.Height/m.DpiScale;
  var color=(Color)ColorConverter.ConvertFromString(cfg.borderColor);
  // Soft, transparent outer glow. Keep the same click-through window and cursor route.
  // Layered borders diffuse light beyond the line without tinting the desktop center.
  double scale=m.DpiScale;
  double inset=cfg.shadow ? Math.Max(12,cfg.shadowBlur*.65)/scale : 1;
  var grid=new Grid{Background=Brushes.Transparent};
  if(cfg.shadow){
   var halo=new Border{
    BorderBrush=new SolidColorBrush(Color.FromArgb(65,color.R,color.G,color.B)),
    BorderThickness=new Thickness((cfg.borderThickness+3)/scale),
    Margin=new Thickness(inset),
    CornerRadius=new CornerRadius(cfg.roundedCorners?22:0),
    Effect=new DropShadowEffect{
     Color=color,BlurRadius=Math.Max(36,cfg.shadowBlur*1.8),
     ShadowDepth=0,Opacity=.62,RenderingBias=RenderingBias.Quality}};
   grid.Children.Add(halo);
  }
  var edge=new Border{BorderBrush=new SolidColorBrush(color),
   BorderThickness=new Thickness(cfg.borderThickness/scale),Margin=new Thickness(inset),
   CornerRadius=new CornerRadius(cfg.roundedCorners?20:0)};
  if(cfg.shadow)edge.Effect=new DropShadowEffect{
   Color=color,BlurRadius=Math.Max(24,cfg.shadowBlur),
   ShadowDepth=0,Opacity=.48,RenderingBias=RenderingBias.Quality};
  grid.Children.Add(edge);
  label.Foreground=new SolidColorBrush(color);label.Background=new SolidColorBrush(Color.FromArgb(210,12,20,18));
  label.FontSize=16;label.FontWeight=FontWeights.Bold;label.Padding=new Thickness(14,7,14,7);
  label.HorizontalAlignment=HorizontalAlignment.Center;label.VerticalAlignment=VerticalAlignment.Top;
  label.Margin=new Thickness(32,inset+cfg.borderThickness+8,32,0);grid.Children.Add(label);Content=grid;
  SourceInitialized+=(_,_)=>{
   var hwnd=new WindowInteropHelper(this).Handle;
   Native.SetWindowLong(hwnd,-20,Native.GetWindowLong(hwnd,-20)|0x08000020|0x80);
   ExcludedFromCapture=Native.SetWindowDisplayAffinity(hwnd,0x11);
   if(!ExcludedFromCapture)throw new InvalidOperationException("OVERLAY_CAPTURE_EXCLUSION_FAILED");
   Native.SetWindowPos(hwnd,new IntPtr(-1),m.X,m.Y,m.Width,m.Height,0x0010|0x0040);
  };
 }
 public void Present(string state){
  label.Text="HERMES COMPUTER USE"+(cfg.showMonitorNumber?$"  MONITOR {monitor.Number:00}":"")+
   (cfg.showAgentStatus?$"  {state}":"");
  if(!IsVisible){Show();if(cfg.animateActivation)
    BeginAnimation(OpacityProperty,new DoubleAnimation(0,cfg.opacity,TimeSpan.FromMilliseconds(220)));
    else Opacity=cfg.opacity;}
 }
}