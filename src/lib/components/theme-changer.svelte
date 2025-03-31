<script lang="ts">
  import { generateThemeCSS, rgbToHsl } from "@/core/theme";
  import { Moon, Sun, Palette, ChevronDown, ChevronUp } from "@lucide/svelte";
  import { Button } from "$lib/components/ui/button";
  import { Slider } from "$lib/components/ui/slider";
  import {
    Popover,
    PopoverContent,
    PopoverTrigger,
  } from "$lib/components/ui/popover";
  import { Label } from "$lib/components/ui/label";
  import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
  } from "$lib/components/ui/sidebar";

  let isOpen = $state(false);
  let baseColor = $state("#708090");
  let globalS = $state(0.5);
  let globalL = $state(0.5);
  let r = $state(0.5);
  let isDarkMode = $state(false);

  let currentTheme = $derived.by(()=>{
    const { h, s, l } = rgbToHsl(baseColor);
    const baseH = h;
    const baseS = s * 100;
    const baseL = l * 100;

    return generateThemeCSS({
      baseH,
      baseS,
      baseL,
      globalS,
      globalL,
      r,
    });
  });

  // CSS를 페이지에 적용
  $effect(() => {
    const style = document.createElement("style");
    style.textContent = currentTheme;
    style.setAttribute("data-theme-style", "false");

    const existingStyles = document.querySelectorAll(
      "style[data-theme-style='false']",
    );
    if (existingStyles.length) {
      for (const existingStyle of existingStyles)
        document.head.removeChild(existingStyle);
    }
    document.head.appendChild(style);
  });

  $effect(()=>{
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  })

  // 다크 모드 토글 핸들러
  const toggleDarkMode = () => {
    isDarkMode = !isDarkMode;
  };
</script>

<SidebarMenu>
  <SidebarMenuItem>
    <Popover bind:open={isOpen}>
      <PopoverTrigger>
        <SidebarMenuButton>
          <Palette class="h-4 w-4" />
          <span>Theme</span>
          {#if isOpen}
            <ChevronUp class="ml-auto h-4 w-4" />
          {:else}
            <ChevronDown class="ml-auto h-4 w-4" />
          {/if}
        </SidebarMenuButton>
      </PopoverTrigger>
      <PopoverContent class="w-80 m-4">
        <div class="grid gap-4">
          <div class="space-y-2">
            <h4 class="font-medium leading-none">Theme Settings</h4>
            <p class="text-sm text-muted-foreground">
              Customize the theme to your liking.
            </p>
          </div>
          <div class="grid gap-2">
            <Label for="baseColor">Base Color</Label>
            <input
              type="color"
              id="baseColor"
              bind:value={baseColor}
              class="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <div class="grid gap-2">
            <Label for="globalS">Saturation</Label>
            <Slider
              type="single"
              id="globalS"
              bind:value={globalS}
              max={1}
              step={0.01}
            />
            <div class="text-sm text-muted-foreground">
              {globalS.toFixed(2)}
            </div>
          </div>
          <div class="grid gap-2">
            <Label for="globalL">Lightness</Label>
            <Slider
              type="single"
              id="globalL"
              bind:value={globalL}
              max={1}
              step={0.01}
            />
            <div class="text-sm text-muted-foreground">
              {globalL.toFixed(2)}
            </div>
          </div>
          <div class="grid gap-2">
            <Label for="r">Border Radius</Label>
            <Slider type="single" id="r" bind:value={r} max={1} step={0.01} />
            <div class="text-sm text-muted-foreground">
              {r.toFixed(2)}
            </div>
          </div>
          <div class="flex justify-end">
            <Button variant="outline" size="icon" onclick={toggleDarkMode}>
              {#if isDarkMode}
                <Sun class="h-[1.2rem] w-[1.2rem]" />
              {:else}
                <Moon class="h-[1.2rem] w-[1.2rem]" />
              {/if}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  </SidebarMenuItem>
</SidebarMenu>
