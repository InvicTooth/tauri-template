<script lang="ts">
  import { onMount } from "svelte";
  import { M } from "svelte-motion";
  import { goto } from "$app/navigation"; // SvelteKit 라우터

  let showSplash = true;

  onMount(() => {
    const timer = setTimeout(() => {
      showSplash = false;
      goto("/main"); // 3초 후 '/main' 경로로 이동 (예시)
    }, 3000);

    return () => clearTimeout(timer);
  });

  // 스플래시 스크린 애니메이션
  const splashVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5, ease: "easeInOut" },
    },
    exit: { opacity: 0, scale: 0.9, transition: { duration: 0.3 } },
  };
</script>

{#if showSplash}
  <M.motion.div
    variants={splashVariants}
    initial="hidden"
    animate="visible"
    exit="exit"
    class="fixed inset-0 bg-blue-500 flex items-center justify-center z-50"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="w-16 h-16 text-white animate-bounce"
    >
      <path d="M4 11V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v5"></path>
      <polyline points="10 15 12 17 14 15"></polyline>
      <path d="M12 17v5"></path>
    </svg>
  </M.motion.div>
{/if}

