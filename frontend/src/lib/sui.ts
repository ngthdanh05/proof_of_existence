import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";
import { NETWORK } from "./constants";

export const suiClient = new SuiClient({
  url: getFullnodeUrl(NETWORK),
});

export async function getProofObject(objectId: string) {
  return await suiClient.getObject({
    id: objectId,
    options: { showContent: true, showOwner: true },
  });
}