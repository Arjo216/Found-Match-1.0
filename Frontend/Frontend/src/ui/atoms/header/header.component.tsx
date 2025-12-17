import { AnimationItem } from "lottie-web";
import { Suspense, lazy } from "react";

const LottieAnimation = lazy(() =>
  import("./parts/lottie-animation/lottie-animation.component").then(
    (m) => ({ default: m.LottieAnimation })
  )
);

export const HeaderComponent = () => {
  return (
    <Suspense fallback={<div>Loading animation...</div>}>
      <LottieAnimation onClick={function (): void {
        throw new Error("Function not implemented.");
      } } setAnimationItem={function (animationItem: AnimationItem): void {
        throw new Error("Function not implemented.");
      } } />
    </Suspense>
  );
};


