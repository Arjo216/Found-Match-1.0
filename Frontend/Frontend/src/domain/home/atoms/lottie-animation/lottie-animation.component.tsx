// src/components/LottieAnimation.tsx
// src/domain/home/atoms/lottie-animation/lottie-animation.component.tsx
import { JSX, useEffect, useRef } from "react";
import S from "./lottie-animation.styles";
import animation from "./lottie-animation.animation";

export const LottieAnimation = (): JSX.Element | null => {
  const animationContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let mounted = true;
    let item: any = null;

    // dynamic import only on client
    (async () => {
      if (!mounted) return;
      if (!animationContainerRef.current) return;

      const lottie = await import("lottie-web");
      item = lottie.default.loadAnimation({
        container: animationContainerRef.current!,
        animationData: animation,
        renderer: "svg",
        loop: true,
        autoplay: true,
      });
    })();

    return () => {
      mounted = false;
      try { item?.destroy?.(); } catch { /* ignore */ }
    };
  }, []);

  return <S.StyledWrapper ref={animationContainerRef} />;
};

export default LottieAnimation;
