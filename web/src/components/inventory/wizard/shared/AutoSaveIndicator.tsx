import { Check, Loader2 } from "lucide-react";

type SaveStatus = "idle" | "saving" | "saved" | "error";

export function AutoSaveIndicator({ status }: { status: SaveStatus }) {
  return (
    <div className="flex items-center gap-1.5 text-xs font-medium">
      {status === "saving" && (
        <>
          <Loader2 className="h-3 w-3 animate-spin text-[#765b00]" />
          <span className="text-[#765b00]">Salvando...</span>
        </>
      )}
      {status === "saved" && (
        <>
          <Check className="h-3 w-3 text-green-600" />
          <span className="text-green-600">Salvo</span>
        </>
      )}
      {status === "error" && (
        <span className="text-red-500">Erro ao salvar</span>
      )}
      {status === "idle" && (
        <span className="text-[#807662]">Progresso local</span>
      )}
    </div>
  );
}
