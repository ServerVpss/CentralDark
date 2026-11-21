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
 readonly Border edge; readonly Border? halo; readonly Border caption;
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
  double inset=2/scale; // reference halo: 11px edge flush with the display
  var grid=new Grid{Background=Brushes.Transparent};
  if(cfg.shadow){
   halo=new Border{
    BorderBrush=new SolidColorBrush(Color.FromArgb(65,color.R,color.G,color.B)),
    BorderThickness=new Thickness((cfg.borderThickness+3)/scale),
    Margin=new Thickness(inset),
    CornerRadius=new CornerRadius(0),
    Effect=new DropShadowEffect{
     Color=color,BlurRadius=Math.Max(36,cfg.shadowBlur*1.8),
     ShadowDepth=0,Opacity=.62,RenderingBias=RenderingBias.Quality}};
   grid.Children.Add(halo);
  }
  edge=new Border{BorderBrush=new SolidColorBrush(color),
   BorderThickness=new Thickness(cfg.borderThickness/scale),Margin=new Thickness(inset),
   CornerRadius=new CornerRadius(0)};
  if(cfg.shadow)edge.Effect=new DropShadowEffect{
   Color=color,BlurRadius=Math.Max(24,cfg.shadowBlur),
   ShadowDepth=0,Opacity=.48,RenderingBias=RenderingBias.Quality};
  grid.Children.Add(edge);
  label.Foreground=new SolidColorBrush(color);
  label.Background=Brushes.Transparent;
  label.FontSize=14;label.FontWeight=FontWeights.Bold;label.Padding=new Thickness(0);
  label.TextAlignment=TextAlignment.Center;label.HorizontalAlignment=HorizontalAlignment.Center;
  label.VerticalAlignment=VerticalAlignment.Center;
  caption=new Border{Child=label,Background=new SolidColorBrush(Color.FromArgb(238,3,8,12)),
   BorderBrush=new SolidColorBrush(color),BorderThickness=new Thickness(1),
   CornerRadius=new CornerRadius(999),Padding=new Thickness(18,11,18,11),
   HorizontalAlignment=HorizontalAlignment.Center,VerticalAlignment=VerticalAlignment.Bottom,
   Margin=new Thickness(20,0,20,48/scale),Effect=new DropShadowEffect{
    Color=color,BlurRadius=26,ShadowDepth=0,Opacity=.48}};
  grid.Children.Add(caption);Content=grid;
  SourceInitialized+=(_,_)=>{
   var hwnd=new WindowInteropHelper(this).Handle;
   Native.SetWindowLong(hwnd,-20,Native.GetWindowLong(hwnd,-20)|0x08000020|0x80);
   ExcludedFromCapture=Native.SetWindowDisplayAffinity(hwnd,0x11);
   if(!ExcludedFromCapture)throw new InvalidOperationException("OVERLAY_CAPTURE_EXCLUSION_FAILED");
   Native.SetWindowPos(hwnd,new IntPtr(-1),m.X,m.Y,m.Width,m.Height,0x0010|0x0040);
  };
 }
 public void Present(string state){
  // Reuse the SAME click-through overlay. Halo-inspired visual state, not a second UI.
  var working=state=="TRABALHANDO";
  var attention=state=="PRECISA DE VOCE";
  var completed=state=="CONCLUIDO";
  // Colors match hero.html: working cyan, attention golden yellow, completed mint green.
  var color=(Color)ColorConverter.ConvertFromString(working ? "#35EAFF" : attention ? "#FFD84A" : completed ? "#64F2A0" : cfg.borderColor);
  var accent=new SolidColorBrush(color);
  label.Foreground=accent;
  label.Text=working ? "●  CÓDIGO EM ANDAMENTO" : attention ? "●  O CÓDIGO PRECISA DE VOCÊ" : completed ? "●  ETAPA CONCLUÍDA" :
    "HERMES COMPUTER USE"+(cfg.showMonitorNumber?$"  MONITOR {monitor.Number:00}":"")+(cfg.showAgentStatus?$"  {state}":"");
  caption.BorderBrush=accent;
  if(caption.Effect is DropShadowEffect captionGlow)captionGlow.Color=color;
  if(working||attention||completed){
   // Moving gradient and breathing glow translated from the supplied HTML reference.
   var beam=new GradientStop(Color.FromArgb(80,color.R,color.G,color.B),0.08);
   var peak=new GradientStop(color,.5);
   var tail=new GradientStop(Color.FromArgb(80,color.R,color.G,color.B),.92);
   var brush=new LinearGradientBrush(new GradientStopCollection{beam,peak,tail},new Point(0,0),new Point(1,1));
   peak.BeginAnimation(GradientStop.OffsetProperty,new DoubleAnimation(.25,.75,TimeSpan.FromMilliseconds(1550)){
    AutoReverse=true,RepeatBehavior=RepeatBehavior.Forever});
   edge.BorderBrush=brush;
   edge.BeginAnimation(OpacityProperty,new DoubleAnimation(.58,1,TimeSpan.FromMilliseconds(attention?820:1850)){
    AutoReverse=true,RepeatBehavior=RepeatBehavior.Forever});
   if(halo!=null)halo.BorderBrush=new SolidColorBrush(Color.FromArgb(65,color.R,color.G,color.B));
   if(edge.Effect is DropShadowEffect glow)glow.Color=color;
   if(halo?.Effect is DropShadowEffect outer)outer.Color=color;
  }else{
   edge.BeginAnimation(OpacityProperty,null);
   edge.BorderBrush=accent;
   if(halo!=null)halo.BorderBrush=new SolidColorBrush(Color.FromArgb(65,color.R,color.G,color.B));
   if(edge.Effect is DropShadowEffect glow)glow.Color=color;
   if(halo?.Effect is DropShadowEffect outer)outer.Color=color;
  }
  var targetOpacity=working||attention||completed ? .95 : cfg.opacity;
  if(!IsVisible){Show();if(cfg.animateActivation)
    BeginAnimation(OpacityProperty,new DoubleAnimation(0,targetOpacity,TimeSpan.FromMilliseconds(220)));
    else Opacity=targetOpacity;}
  else {BeginAnimation(OpacityProperty,null);Opacity=targetOpacity;}
 }
}