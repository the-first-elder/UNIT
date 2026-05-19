import type { SVGProps } from "react";

type LogoProps = SVGProps<SVGSVGElement>;

export function AaveLogo(props: LogoProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" {...props}>
      <circle cx="16" cy="16" r="16" fill="#B6509E" />
      <path d="M10.5 22L15 10h2l4.5 12h-2.2l-1.2-3.2h-4.2L12.7 22h-2.2zm3.8-4.8h3.4L16 12.5l-1.7 4.7z" fill="white" />
    </svg>
  );
}

export function CompoundLogo(props: LogoProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" {...props}>
      <circle cx="16" cy="16" r="16" fill="#00D395" />
      <path d="M16 6l10 5.8v11.6L16 29l-10-5.8V11.8L16 6zm0 2.3L8 12.8v8.8l8 4.6 8-4.6v-8.8l-8-4.5z" fill="white" />
      <circle cx="16" cy="16.5" r="3.5" fill="white" />
    </svg>
  );
}

export function SparkLogo(props: LogoProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" {...props}>
      <circle cx="16" cy="16" r="16" fill="#FFB347" />
      <path d="M16 5l2.5 7.5H26l-6 5 2.5 7.5-6-5-6 5L13 17.5l-6-5h7.5L16 5z" fill="white" />
    </svg>
  );
}

export function MorphoLogo(props: LogoProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" {...props}>
      <circle cx="16" cy="16" r="16" fill="#1a1a2e" />
      <path d="M10 8h4v16h-4V8z" fill="#6366F1" />
      <path d="M18 8h4v10a4 4 0 01-4 4V8z" fill="#818CF8" />
    </svg>
  );
}

export function EthenaLogo(props: LogoProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" {...props}>
      <circle cx="16" cy="16" r="16" fill="#1B9C5A" />
      <path d="M16 6l10 10-10 10-10-10 10-10z" fill="white" opacity="0.9" />
      <path d="M16 10l6 6-6 6-6-6 6-6z" fill="#1B9C5A" />
    </svg>
  );
}

export function PendleLogo(props: LogoProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" {...props}>
      <circle cx="16" cy="16" r="16" fill="#6366F1" />
      <path d="M11 10h4l4 6-4 6h-4l4-6-4-6z" fill="white" />
      <path d="M17 10h4l-4 6 4 6h-4" fill="white" opacity="0.6" />
    </svg>
  );
}

export function CurveLogo(props: LogoProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" {...props}>
      <circle cx="16" cy="16" r="16" fill="#F10000" />
      <path d="M22 10c-3 0-5.5 2-6 5.5C15.5 12 13 10 10 10v2c2.2 0 4 1.8 4 4v6h2v-6c0-2.2 1.8-4 4-4s4 1.8 4 4v6h2v-6c0-3.3-2.7-6-6-6z" fill="white" />
    </svg>
  );
}

export function LifiLogo(props: LogoProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" {...props}>
      <circle cx="16" cy="16" r="16" fill="#3B82F6" />
      <path d="M9 16l4-4v3h6v-3l4 4-4 4v-3h-6v3l-4-4z" fill="white" />
    </svg>
  );
}

export function UniswapLogo(props: LogoProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" {...props}>
      <circle cx="16" cy="16" r="16" fill="#FF007A" />
      <path d="M16 7l3.5 7h-7L16 7z" fill="white" />
      <path d="M12.5 16h7L16 23l-3.5-7z" fill="white" opacity="0.6" />
    </svg>
  );
}

export function BalancerLogo(props: LogoProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" {...props}>
      <circle cx="16" cy="16" r="16" fill="#1E1E1E" />
      <path d="M9 13l7-5 7 5v6l-7 5-7-5v-6z" stroke="white" strokeWidth="1.5" fill="none" />
      <circle cx="16" cy="13" r="2" fill="white" />
      <circle cx="11" cy="16" r="1.5" fill="white" />
      <circle cx="21" cy="16" r="1.5" fill="white" />
      <circle cx="16" cy="19" r="2" fill="white" />
    </svg>
  );
}

const logoMap: Record<string, typeof AaveLogo> = {
  Aave: AaveLogo,
  Compound: CompoundLogo,
  Spark: SparkLogo,
  Morpho: MorphoLogo,
  Ethena: EthenaLogo,
  Pendle: PendleLogo,
  Curve: CurveLogo,
  "LI.FI": LifiLogo,
  Uniswap: UniswapLogo,
  Balancer: BalancerLogo,
};

export function getProtocolLogo(name: string) {
  return logoMap[name];
}
