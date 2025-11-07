"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../main/lib/AuthContext";

interface CommentData {
  _id: string;
  username: string;
  text: string;
  createdAt: string;
}

function CommentPage() {
  const { isLoggedIn, isLoading } = useAuth();
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<CommentData[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchComments = async () => {
    try {
      const response = await fetch("/backend/comments");
      if (!response.ok) {
        throw new Error("Failed to fetch comments");
      }
      const data = await response.json();
      setComments(data.comments);
    } catch (err) {
      console.error("Error fetching comments:", err);
      setError("Failed to load comments.");
    }
  };

  useEffect(() => {
    fetchComments();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!isLoggedIn) {
      setError("Please log in to leave a comment.");
      return;
    }

    if (commentText.trim() === "") {
      setError("Comment cannot be empty.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/backend/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: commentText }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to post comment.");
      }

      setSuccessMessage(data.message);
      setCommentText("");
      fetchComments();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen dark:bg-gray-900 bg-gray-100">
        Загрузка...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 sm:p-6 lg:p-8 pt-20">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">Комментарии</h1>

        {isLoggedIn ? (
          <form
            onSubmit={handleSubmit}
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8"
          >
            <h2 className="text-xl font-semibold mb-4">Оставить комментарий</h2>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            {successMessage && (
              <p className="text-green-500 mb-4">{successMessage}</p>
            )}
            <div className="mb-4">
              <label
                htmlFor="comment"
                className="block text-sm font-medium mb-2"
              >
                Ваш комментарий:
              </label>
              <textarea
                id="comment"
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                rows={4}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Напишите свой комментарий здесь..."
                disabled={isSubmitting}
              ></textarea>
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Отправка..." : "Отправить комментарий"}
            </button>
          </form>
        ) : (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8 text-center">
            <p className="text-lg">
              Пожалуйста,{" "}
              <a href="/auth" className="text-blue-500 hover:underline">
                войдите
              </a>
              , чтобы оставить комментарий.
            </p>
          </div>
        )}

        <div className="space-y-4">
          <h2 className="text-2xl font-bold mb-4">Все комментарии</h2>
          {comments.length === 0 ? (
            <p>Комментариев пока нет.</p>
          ) : (
            comments.map((comment) => (
              <div
                key={comment._id}
                className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm flex flex-col sm:flex-row sm:items-baseline"
              >
                <p className="font-semibold text-blue-600 dark:text-blue-400 mr-2">
                  {comment.username}
                </p>
                <p className="text-gray-700 dark:text-gray-300 flex-grow">
                  {comment.text}
                </p>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-2 sm:mt-0 sm:ml-4 flex-shrink-0">
                  {new Date(comment.createdAt).toLocaleString()}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default CommentPage;
