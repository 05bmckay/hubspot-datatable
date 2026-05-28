import type { ReactNode } from "react";
import type { BuiltOption } from "./utils";
import type {
  AutoTagOptions,
  AutoTagVariant,
  AutoStatusTagOptions,
  AutoStatusTagVariant,
} from "./utils";

export interface AutoTagProps extends AutoTagOptions {
  value?: unknown;
  tag?: unknown;
  children?: ReactNode;
  variant?: AutoTagVariant;
  onClick?: () => void;
  onDelete?: () => void;
  overlay?: unknown;
  inline?: boolean;
}

export interface AutoStatusTagProps extends AutoStatusTagOptions {
  value?: unknown;
  status?: unknown;
  children?: ReactNode;
  variant?: AutoStatusTagVariant;
  hollow?: boolean;
  onClick?: () => void;
  showRemoveIcon?: boolean;
  onRemoveClick?: () => void;
}

export interface SectionHeaderProps {
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
  gap?: string;
  titleAs?: string;
}

export interface KeyValueListItem {
  key?: string | number;
  label: ReactNode;
  value: ReactNode;
}

export interface KeyValueListProps {
  items?: KeyValueListItem[];
  direction?: "row" | "column";
  gap?: string;
}

export interface DatePresetOption {
  label: string;
  value: string;
}

export interface DateDirectionLabels {
  asc: string;
  desc: string;
}

export interface AvatarStackItemObject {
  letter?: string;
  color?: string;
  src?: string;
}

export type AvatarStackItem = string | AvatarStackItemObject;

export interface AvatarStackDataUriResult {
  src: string;
  width: number;
  height: number;
  count: number;
}

export interface AvatarStackProps {
  items?: AvatarStackItem[] | null;
  size?:
    | number
    | "xs"
    | "extra-small"
    | "sm"
    | "small"
    | "md"
    | "med"
    | "medium"
    | "lg"
    | "large"
    | "xl"
    | "extra-large";
  overlap?: number;
  step?: number;
  maxVisible?: number;
  colors?: string[];
  overflowBg?: string;
  overflowColor?: string;
  fontFamily?: string;
  alt?: string;
}

export interface CrmLookupSelectProps {
  objectType: "contact" | "contacts" | "company" | "companies" | "deal" | "deals" | string;
  properties?: string[];
  name?: string;
  label?: string;
  value?: string | number | boolean | Array<string | number | boolean>;
  onChange?: (value: string | number | boolean | Array<string | number | boolean>) => void;
  multiple?: boolean;
  placeholder?: string;
  description?: string;
  tooltip?: string;
  required?: boolean;
  readOnly?: boolean;
  error?: boolean;
  validationMessage?: string;
  variant?: "transparent" | "input";
  debounce?: number;
  minSearchLength?: number;
  pageLength?: number;
  option?: {
    label?: string | ((row: Record<string, unknown>) => unknown);
    value?: string | ((row: Record<string, unknown>) => unknown);
    description?: string | ((row: Record<string, unknown>) => unknown);
    fallbackLabel?: string;
    mapOption?: (row: Record<string, unknown>) => BuiltOption;
  };
  labelProperty?: string | ((row: Record<string, unknown>) => unknown);
  valueProperty?: string | ((row: Record<string, unknown>) => unknown);
  descriptionProperty?: string | ((row: Record<string, unknown>) => unknown);
  selectedOptions?: BuiltOption | BuiltOption[];
  format?: Record<string, unknown>;
  row?: Record<string, unknown>;
  baseConfig?: Record<string, unknown>;
  query?: string;
  onSearchChange?: (query: string) => void;
  noResultsOption?: BuiltOption;
  loadingOption?: BuiltOption;
  selectProps?: Record<string, unknown>;
}

export interface StyledTextFormat {
  fontWeight?: "bold" | "demibold" | "regular" | number;
  italic?: boolean;
  lineDecoration?: "underline" | "strikethrough";
  textTransform?: "uppercase" | "lowercase" | "capitalize" | "sentenceCase" | "none";
}

export interface StyledTextBackground {
  preset?: "tag";
  variant?: "default" | "success" | "warning" | "error" | "danger" | "info";
  color?: string;
  textColor?: string;
  borderColor?: string;
  borderWidth?: number;
  radius?: number;
  paddingX?: number;
  paddingY?: number;
  height?: number;
  fontSize?: number;
  canvasPaddingX?: number;
  canvasPaddingY?: number;
}

export interface StyledTextDataUriResult {
  src: string;
  width: number;
  height: number;
}

export interface StyledTextSharedProps {
  text?: string;
  children?: ReactNode;
  alt?: string;
  variant?: "bodytext" | "microcopy";
  format?: StyledTextFormat;
  orientation?: "horizontal" | "vertical-up" | "vertical-down" | number;
  color?: string;
  background?: StyledTextBackground | null;
  fontFamily?: string;
  fontSize?: number;
  paddingX?: number;
  paddingY?: number;
  width?: number;
  height?: number;
}

export interface StyledTextDataUriOptions extends Omit<StyledTextSharedProps, "children" | "text" | "alt"> {}

export interface StyledTextProps extends StyledTextSharedProps {}

export type SpinnerName =
  | "braille"
  | "braillewave"
  | "dna"
  | "scan"
  | "rain"
  | "scanline"
  | "pulse"
  | "snake"
  | "sparkle"
  | "cascade"
  | "columns"
  | "orbit"
  | "breathe"
  | "waverows"
  | "checkerboard"
  | "helix"
  | "fillsweep"
  | "diagswipe";

export interface SpinnerPreset {
  frames: readonly string[];
  interval: number;
}

export interface SpinnerProps {
  name?: SpinnerName | string;
  frames?: readonly string[];
  interval?: number;
  label?: ReactNode;
  children?: ReactNode;
  paused?: boolean;
  gap?: string;
  variant?: "bodytext" | "microcopy";
  format?: StyledTextFormat;
  inline?: boolean;
  truncate?: boolean | { tooltipText?: string };
}

export declare function AutoTag(props: AutoTagProps): ReactNode;
export declare function AutoStatusTag(props: AutoStatusTagProps): ReactNode;
export declare function SectionHeader(props: SectionHeaderProps): ReactNode;
export declare function KeyValueList(props: KeyValueListProps): ReactNode;
export declare function AvatarStack(props: AvatarStackProps): ReactNode;
export declare function CrmLookupSelect(props: CrmLookupSelectProps): ReactNode;
export declare function StyledText(props: StyledTextProps): ReactNode;
export declare function Spinner(props: SpinnerProps): ReactNode;
export declare const SPINNERS: Record<SpinnerName, SpinnerPreset>;
export declare const SPINNER_NAMES: SpinnerName[];
export declare function gridToBraille(grid: boolean[][]): string;
export declare function makeGrid(rows: number, cols: number): boolean[][];
export declare function makeAvatarStackDataUri(
  items?: AvatarStackItem[] | null,
  options?: Omit<AvatarStackProps, "items" | "alt">
): AvatarStackDataUriResult | null;
export declare function makeStyledTextDataUri(
  text: string,
  options?: StyledTextDataUriOptions
): StyledTextDataUriResult;

export declare const HS_DATE_PRESETS: DatePresetOption[];
export declare const HS_DATE_DIRECTION_LABELS: DateDirectionLabels;
export declare const HS_FONT_FAMILY: string;
export declare const HS_TEXT_COLOR: string;
export declare const HS_SUBTLE_BG: string;
export declare const HS_MUTED_TEXT: string;
export declare const HS_NEUTRAL_CHIP: string;
export declare const HS_TAG_SUBTLE_BORDER: string;
export declare const HS_TAG_TEXT_COLOR: string;
export declare const HS_TAG_FONT_SIZE: number;
export declare const HS_TAG_LINE_HEIGHT: number;
export declare const HS_TAG_PADDING_X: number;
export declare const HS_TAG_PADDING_Y: number;
export declare const HS_TAG_BORDER_RADIUS: number;
export declare const HS_TAG_BORDER_WIDTH: number;
export declare const DEFAULT_SVG_FONT_WEIGHT: number;
