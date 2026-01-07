import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Image, 
  Megaphone, 
  Wand2, 
  Layers, 
  Send,
  Cat,
  Home,
  Bell,
  PenTool,
  GalleryHorizontal,
  ListTodo,
  Users,
  Settings2,
  ChevronDown,
  Upload,
  Palette,
  Building2,
  Sparkles,
  Play,
  RefreshCw,
  MessageSquare,
  Paperclip,
  Mic,
  ImageIcon
} from "lucide-react";

const navItems = [
  { id: "home", label: "Home", icon: Home },
  { id: "notifications", label: "Notifications", icon: Bell, badge: 9 },
  { id: "visual-editor", label: "Visual Editor", icon: PenTool },
  { id: "gallery", label: "Gallery", icon: GalleryHorizontal },
  { id: "task-lists", label: "Task Lists", icon: ListTodo },
  { id: "users", label: "Users", icon: Users },
  { id: "presets", label: "Presets", icon: Settings2 },
];

const quickActions = [
  { id: "brand", label: "Set up brand", icon: Palette, color: "from-primary to-purple-400" },
  { id: "campaign", label: "Create campaign", icon: Megaphone, color: "from-violet-500 to-purple-400" },
  { id: "image", label: "Generate image", icon: Image, color: "from-pink-500 to-rose-500" },
  { id: "edit", label: "Edit image", icon: Wand2, color: "from-blue-500 to-cyan-400" },
  { id: "batch", label: "Batch generate", icon: Layers, color: "from-emerald-500 to-teal-400" },
];

const moodboardImages = [
  "/placeholder.svg", "/placeholder.svg", "/placeholder.svg", "/placeholder.svg",
  "/placeholder.svg", "/placeholder.svg", "/placeholder.svg", "/placeholder.svg",
];

const Index = () => {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState("");
  const [chatMessage, setChatMessage] = useState("");
  const [activeNav, setActiveNav] = useState("home");
  
  // Section refs for scrolling
  const brandRef = useRef<HTMLDivElement>(null);
  const campaignRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  // Brand state
  const [brandName, setBrandName] = useState("");
  const [brandTagline, setBrandTagline] = useState("");
  const [brandIndustry, setBrandIndustry] = useState("");

  // Campaign state
  const [campaignName, setCampaignName] = useState("");
  const [selectedMoodboard, setSelectedMoodboard] = useState<string | null>(null);

  // Image generation state
  const [imagePrompt, setImagePrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [imageCount, setImageCount] = useState("1x");

  const scrollToSection = (sectionId: string) => {
    const refs: Record<string, React.RefObject<HTMLDivElement>> = {
      brand: brandRef,
      campaign: campaignRef,
      image: imageRef,
      edit: imageRef,
      batch: imageRef,
    };
    refs[sectionId]?.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleQuickAction = (actionId: string) => {
    scrollToSection(actionId);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      scrollToSection("image");
      setImagePrompt(prompt);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm px-6 py-3">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <span className="font-display text-xl font-bold text-foreground">KittyKat</span>
            <span className="text-primary text-2xl">.</span>
          </div>

          {/* Nav Items */}
          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveNav(item.id)}
                  className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors relative ${
                    activeNav === item.id 
                      ? "text-primary" 
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  }`}
                >
                  <div className="relative">
                    <Icon className="w-5 h-5" />
                    {item.badge && (
                      <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-primary text-[10px] text-white rounded-full flex items-center justify-center font-medium">
                        {item.badge}+
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <span>957</span>
              <span className="text-primary">💎</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 text-sm font-medium">
              <span>3,491,370</span>
              <span>$</span>
            </div>
            <button className="p-2 rounded-lg hover:bg-secondary">
              <Settings2 className="w-5 h-5 text-muted-foreground" />
            </button>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
              K
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout: Content + Chat Sidebar */}
      <div className="flex-1 flex">
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          {/* Hero Section */}
          <section className="px-8 py-16 max-w-4xl mx-auto">
            <div className="text-center mb-10 animate-fade-in">
              <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
                What would you like to <span className="text-gradient">create</span> today?
              </h1>
              <p className="text-muted-foreground text-lg">
                Describe your vision and let AI bring it to life
              </p>
            </div>

            {/* Main Prompt Input */}
            <form onSubmit={handleSubmit} className="relative mb-8 animate-fade-in" style={{ animationDelay: "0.1s" }}>
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe your ad creative..."
                  rows={3}
                  className="relative command-input resize-none pr-16"
                />
              </div>
              <button
                type="submit"
                className="absolute right-4 bottom-4 w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-purple-500 hover:opacity-90 flex items-center justify-center transition-all disabled:opacity-50 shadow-lg shadow-primary/25"
                disabled={!prompt.trim()}
              >
                <Send className="w-5 h-5 text-white" />
              </button>
            </form>

            {/* Quick Actions */}
            <div className="flex flex-wrap justify-center gap-3 animate-fade-in" style={{ animationDelay: "0.2s" }}>
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.id}
                    onClick={() => handleQuickAction(action.id)}
                    className="action-chip group hover:scale-105 transition-all"
                  >
                    <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center`}>
                      <Icon className="w-3.5 h-3.5 text-white" />
                    </div>
                    {action.label}
                  </button>
                );
              })}
            </div>

            <div className="flex justify-center mt-12 animate-bounce">
              <ChevronDown className="w-6 h-6 text-muted-foreground" />
            </div>
          </section>

          {/* Brand Setup Section */}
          <section ref={brandRef} className="px-8 py-16 border-t border-border bg-secondary/20">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-purple-400 flex items-center justify-center">
                  <Palette className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="font-display text-2xl font-bold">Brand Setup</h2>
                  <p className="text-sm text-muted-foreground">Define your brand identity</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="glass-card p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Brand Name</label>
                    <input
                      type="text"
                      value={brandName}
                      onChange={(e) => setBrandName(e.target.value)}
                      placeholder="Enter your brand name"
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Tagline</label>
                    <input
                      type="text"
                      value={brandTagline}
                      onChange={(e) => setBrandTagline(e.target.value)}
                      placeholder="Your brand's tagline"
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Industry</label>
                    <input
                      type="text"
                      value={brandIndustry}
                      onChange={(e) => setBrandIndustry(e.target.value)}
                      placeholder="e.g., Fashion, Jewelry, Beauty"
                      className="input-field"
                    />
                  </div>
                </div>

                <div className="glass-card p-6">
                  <label className="block text-sm font-medium mb-4">Brand Logo</label>
                  <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/30 transition-colors cursor-pointer">
                    <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                    <p className="font-medium mb-1">Upload your logo</p>
                    <p className="text-sm text-muted-foreground">PNG, JPG up to 5MB</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Campaign Section */}
          <section ref={campaignRef} className="px-8 py-16 border-t border-border">
            <div className="max-w-5xl mx-auto">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-400 flex items-center justify-center">
                  <Megaphone className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="font-display text-2xl font-bold">Campaign Setup</h2>
                  <p className="text-sm text-muted-foreground">Create your advertising campaign</p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Moodboard */}
                <div className="glass-card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold">Reference Moodboard</h3>
                      <p className="text-sm text-muted-foreground">Everyday Icons: Helzberg Necklace's Moodboard v1</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="🔍 Select Moodboard"
                        className="input-field w-48 text-sm"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                    {moodboardImages.map((img, idx) => (
                      <div 
                        key={idx}
                        onClick={() => setSelectedMoodboard(img)}
                        className={`aspect-square rounded-lg bg-secondary overflow-hidden cursor-pointer border-2 transition-all ${
                          selectedMoodboard === img ? "border-primary" : "border-transparent hover:border-primary/30"
                        }`}
                      >
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Prompts */}
                <div className="glass-card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold">Prompts</span>
                      <select className="bg-secondary border border-border rounded-lg px-3 py-1.5 text-sm">
                        <option>3</option>
                        <option>5</option>
                        <option>10</option>
                      </select>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary font-medium hover:bg-primary/20 transition-colors">
                      <Sparkles className="w-4 h-4" />
                      Generate Prompts
                    </button>
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="p-4 rounded-xl bg-secondary/50 border border-border">
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          A young woman in her late twenties with luminous fair skin stands confidently in an urban setting...
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Image Generation Section */}
          <section ref={imageRef} className="px-8 py-16 border-t border-border bg-secondary/20">
            <div className="max-w-5xl mx-auto">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
                  <ImageIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="font-display text-2xl font-bold">Image Generation</h2>
                  <p className="text-sm text-muted-foreground">Create stunning visuals with AI</p>
                </div>
              </div>

              <div className="glass-card p-6">
                {/* Controls Row */}
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border">
                  <div className="flex items-center gap-2">
                    <button className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors">
                      <ImageIcon className="w-5 h-5" />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground">
                      <Play className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {["1:1", "4:5", "16:9"].map((ratio) => (
                      <button
                        key={ratio}
                        onClick={() => setAspectRatio(ratio)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          aspectRatio === ratio
                            ? "bg-primary text-white"
                            : "bg-secondary hover:bg-secondary/80"
                        }`}
                      >
                        {ratio}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    {["1x", "2x", "4x"].map((count) => (
                      <button
                        key={count}
                        onClick={() => setImageCount(count)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          imageCount === count
                            ? "bg-primary text-white"
                            : "bg-secondary hover:bg-secondary/80"
                        }`}
                      >
                        {count}
                      </button>
                    ))}
                  </div>

                  <div className="ml-auto flex items-center gap-3">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">Model</span>
                      <select className="bg-secondary border border-border rounded-lg px-3 py-1.5">
                        <option>🌐 GPT Image 1</option>
                        <option>🎨 DALL-E 3</option>
                        <option>✨ Midjourney</option>
                      </select>
                    </div>
                    <button className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-primary to-purple-500 text-white font-medium hover:opacity-90 transition-all">
                      Generate (1,700 tokens)
                    </button>
                  </div>
                </div>

                {/* Prompt Input */}
                <div className="mb-6">
                  <div className="flex items-start gap-3">
                    <ImageIcon className="w-5 h-5 text-muted-foreground mt-1" />
                    <textarea
                      value={imagePrompt}
                      onChange={(e) => setImagePrompt(e.target.value)}
                      placeholder="Describe what you want to see ..."
                      rows={3}
                      className="flex-1 bg-transparent border-none resize-none focus:outline-none text-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                </div>

                {/* Image Grid */}
                <div className="grid grid-cols-3 gap-4">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div 
                      key={i}
                      className="aspect-square rounded-xl bg-secondary/50 border border-border flex items-center justify-center"
                    >
                      <div className="text-center text-muted-foreground">
                        <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* Right Chat Sidebar */}
        <aside className="w-[400px] border-l border-border bg-card flex flex-col">
          {/* Toggle */}
          <div className="p-4 border-b border-border">
            <button className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <ChevronDown className="w-4 h-4 rotate-90" />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="p-4 rounded-xl bg-primary/10 text-sm">
              <p>...image generation, ensuring it is fully aligned with the provided brand persona.</p>
            </div>
            
            <div className="p-4 rounded-xl bg-secondary text-sm">
              <p>A poised young woman in her mid-20s stands confidently solo in an urban Northeast city setting, dressed in elevated minimal or soft feminine chic business attire. She is posed in a focused, aspirational manner—perhaps near a sleek office desk or with a cityscape backdrop—her look enhanced by elegant, affordable jewelry that subtly signifies accomplishment and ambition.</p>
            </div>
          </div>

          {/* Chat Input */}
          <div className="p-4 border-t border-border">
            <div className="relative">
              <textarea
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Type your message here..."
                rows={3}
                className="w-full bg-secondary border border-border rounded-xl p-4 pr-12 resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <div className="absolute bottom-3 left-3 flex items-center gap-2">
                <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                  <input type="checkbox" className="rounded" />
                  Chat Only Mode
                </label>
              </div>
              <div className="absolute bottom-3 right-3 flex items-center gap-2">
                <button className="p-2 rounded-lg hover:bg-secondary/80 text-muted-foreground">
                  <ImageIcon className="w-4 h-4" />
                </button>
                <button className="p-2 rounded-lg hover:bg-secondary/80 text-muted-foreground">
                  <Paperclip className="w-4 h-4" />
                </button>
                <button className="p-2 rounded-lg hover:bg-secondary/80 text-muted-foreground">
                  <Mic className="w-4 h-4" />
                </button>
                <button className="p-2 rounded-lg bg-primary text-white">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Index;
