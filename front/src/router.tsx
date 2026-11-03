import type { AnchorHTMLAttributes, MouseEvent } from "react";
import { navigate } from "./navigation";
export function Link({
  href = "/",
  onClick,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement>) {
  function follow(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event);
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      props.target === "_blank" ||
      props.download
    )
      return;
    const url = new URL(href, window.location.href);
    if (url.origin !== window.location.origin || href.startsWith("#")) return;
    event.preventDefault();
    navigate(href);
  }
  return <a href={href} onClick={follow} {...props} />;
}
