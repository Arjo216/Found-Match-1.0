import { JSX, useEffect, useRef } from "react";
import animation from "./lottie-animation.animation";
import S from "./lottie-animation.styles";
import { ILottieAnimationProps } from "./lottie-animation.types";

export const LottieAnimation = ({
  onClick,
  setAnimationItem,
}: ILottieAnimationProps): JSX.Element => {
  const animationContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let mounted = true;
    let item: any = null;

    (async () => {
      if (!mounted) return;
      if (!animationContainerRef.current) return;

      // 🔥 dynamic import so server does NOT load lottie-web
      const lottie = await import("lottie-web");

      item = lottie.default.loadAnimation({
        loop: false,
        autoplay: false,
        animationData: animation,
        container: animationContainerRef.current,
      });

      setAnimationItem(item);
    })();

    return () => {
      mounted = false;
      try {
        item?.destroy?.();
      } catch {}
    };
  }, []);

  return <S.StyledWrapper ref={animationContainerRef} onClick={onClick} />;
};
export default LottieAnimation;