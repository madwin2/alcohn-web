export type {
  CotizacionResult,
  CotizadorCatalog,
  FuentePrecio,
  GrupoCodigo,
} from './types';
export { getCotizadorCatalog } from './catalogCache';
export {
  cotizarRectangular,
  cotizarRectangularMm,
  resolveGrupoCodigo,
  resolveGrupoCodigoMm,
} from './quote';
export { catalogMeasuresByGrupo } from './suggestedTierSizes';
export { parseMedidaUsuario, round4 } from './utils';
export {
  STAMP_MM_MAX_LONG,
  STAMP_MM_MAX_SHORT,
  STAMP_MM_MIN_LONG,
  STAMP_MM_MIN_SHORT,
  STAMP_SIZE_RANGE_LABEL,
  fitProportionalStampSize,
  isValidStampSizeMm,
} from './stampSizeLimits';
export {
  buildSuggestedTierDimensions,
  catalogRefToDisplayMm,
  fitLogoInCatalogEnvelope,
  formatStampSizeMm,
  isSquareLogo,
  type SuggestedTierDimension,
  type SuggestedTierKey,
} from './suggestedTierSizes';
