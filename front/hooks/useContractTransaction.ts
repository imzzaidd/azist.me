"use client";

import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { toast } from "sonner";
import { useEffect } from "react";

export function useContractTransaction() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    if (error) {
      toast.error("Error en transacción", {
        description: error.message,
      });
    }
  }, [error]);

  useEffect(() => {
    if (hash && isConfirming) {
      toast.loading("Confirmando transacción...", {
        id: hash,
      });
    }
  }, [hash, isConfirming]);

  useEffect(() => {
    if (isSuccess && hash) {
      toast.success("Transacción exitosa", {
        id: hash,
        description: "La operación se completó correctamente",
      });
    }
  }, [isSuccess, hash]);

  return {
    write: writeContract,
    isPending: isPending || isConfirming,
    hash,
    isConfirming,
    isSuccess,
    error,
  };
}
