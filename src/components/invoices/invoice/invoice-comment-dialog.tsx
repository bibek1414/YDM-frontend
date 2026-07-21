"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  useGetInvoiceComments,
  useCommentOnInvoice,
} from "../invoices.queries";
import { Skeleton } from "@/components/ui/skeleton";

interface InvoiceCommentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoiceId: number;
  invoiceCode?: string;
}

interface Comment {
  id: number;
  comment: string;
  created_at: string;
  user?: {
    first_name: string;
    last_name: string;
    role: string;
  };
}

const formatDateTime = (iso: string) => {
  const d = new Date(iso);
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
};

export function InvoiceCommentDialog({
  open,
  onOpenChange,
  invoiceId,
  invoiceCode,
}: InvoiceCommentDialogProps) {
  const [newComment, setNewComment] = useState("");

  const { data: comments, isLoading } = useGetInvoiceComments(invoiceId);
  const commentMutation = useCommentOnInvoice();

  const handleSubmit = async () => {
    if (newComment.trim()) {
      try {
        await commentMutation.mutateAsync({
          id: invoiceId,
          comments: newComment.trim(),
        });
        setNewComment("");
      } catch (error) {
        // Error is handled by the mutation
      }
    }
  };

  const handleClose = () => {
    setNewComment("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>
            Invoice Comments {invoiceCode && `- ${invoiceCode}`}
          </DialogTitle>
          <DialogDescription>
            View and add comments for this invoice
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 py-4">
          {/* Existing Comments */}
          <div className="space-y-3">
            <h3 className="font-medium text-sm text-gray-700">
              Previous Comments
            </h3>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                ))}
              </div>
            ) : comments && comments.length > 0 ? (
              <div className="space-y-3">
                {comments.map((comment: Comment) => (
                  <div
                    key={comment.id}
                    className="p-3 bg-gray-50 rounded-lg border"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {comment.user && (
                          <>
                            <span className="font-medium text-sm">
                              {comment.user.first_name} {comment.user.last_name}
                            </span>
                            <Badge variant="secondary" className="text-xs">
                              {comment.user.role}
                            </Badge>
                          </>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">
                        {formatDateTime(comment.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {comment.comment}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 text-sm">
                No comments yet
              </div>
            )}
          </div>

          {/* Add New Comment */}
          <div className="space-y-3 pt-4 border-t">
            <h3 className="font-medium text-sm text-gray-700">
              Add New Comment
            </h3>
            <Textarea
              placeholder="Enter your comment here..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={commentMutation.isPending}
          >
            Close
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={commentMutation.isPending || !newComment.trim()}
          >
            {commentMutation.isPending ? "Adding..." : "Add Comment"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
