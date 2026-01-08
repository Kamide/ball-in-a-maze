import { useEffect } from "react";
import { useWakeLock } from "react-screen-wake-lock";

export type ScreenWakeLockProps = {
  onError?: (error: Error) => void;
};

export function ScreenWakeLock(props: ScreenWakeLockProps) {
  const { onError = console.error } = props;

  const { request, release } = useWakeLock({
    onError,
  });

  useEffect(() => {
    let acquired = false;

    request("screen")
      .then(() => {
        acquired = true;
      })
      .catch(onError);

    return () => {
      if (acquired) {
        release()
          .then(() => {
            acquired = false;
          })
          .catch(onError);
      }
    };
  }, [request, release, onError]);

  return null;
}
