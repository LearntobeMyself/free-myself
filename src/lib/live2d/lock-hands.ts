type Live2DModelInstance = import("pixi-live2d-display/cubism4").Live2DModel;

type CoreWithParams = {
  setParameterValueById: (id: string, value: number, weight?: number) => void;
};

type InternalWithEvents = {
  coreModel: CoreWithParams;
  on: (event: string, fn: () => void) => void;
  off: (event: string, fn: () => void) => void;
};

const HAND_CHANGE_PARAMS = ["ParamHandChangeR", "ParamHandDhangeL"] as const;

/**
 * Clothes variants lack some Haru hand morphs. Motions that switch
 * ParamHandChange* can leave empty hands (esp. arms-crossed poses).
 * Force default hand form every frame after motion writes parameters.
 */
export function lockHandMorphs(model: Live2DModelInstance): () => void {
  const internal = model.internalModel as unknown as InternalWithEvents;

  const onBeforeUpdate = () => {
    for (const id of HAND_CHANGE_PARAMS) {
      internal.coreModel.setParameterValueById(id, 0);
    }
  };

  internal.on("beforeModelUpdate", onBeforeUpdate);
  return () => {
    internal.off("beforeModelUpdate", onBeforeUpdate);
  };
}
