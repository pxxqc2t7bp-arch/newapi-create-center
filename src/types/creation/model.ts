export interface CreationModel {
  id: string;
  name: string;
  provider?: string;
  tags?: string[];
  capabilities?: string[];
  modes?: string[];
  supportsImageInput?: boolean;
  supportsVideoInput?: boolean;
  description?: string;
  enabled?: boolean;
  estimatedUnitCost?: number;
  price?: unknown;
  currency?: "quota" | "token" | "credit";
}

// Helpers designed to accommodate capabilities, modes, and tags
export function modelSupportsChat(model: CreationModel): boolean {
  return hasCapability(model, "chat");
}

export function modelSupportsImageInputForChat(model: CreationModel): boolean {
  return model.supportsImageInput === true;
}

export function modelSupportsTextToImage(model: CreationModel): boolean {
  return hasCapability(model, "text-to-image");
}

export function modelSupportsImageToImage(model: CreationModel): boolean {
  return hasCapability(model, "image-to-image");
}

export function modelSupportsTextToVideo(model: CreationModel): boolean {
  return hasCapability(model, "text-to-video");
}

export function modelSupportsImageToVideo(model: CreationModel): boolean {
  return hasCapability(model, "image-to-video");
}

function hasCapability(model: CreationModel, feature: string): boolean {
  if (model.capabilities?.includes(feature)) return true;
  if (model.modes?.includes(feature)) return true;
  if (model.tags?.includes(feature)) return true;
  return false;
}
