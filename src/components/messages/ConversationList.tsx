import Link from "next/link";
import { MessageCircle } from "lucide-react";

interface Conversation {
  id: string;
  otherName: string;
  lastMessageAt: string;
  unreadCount: number;
}

interface Props {
  conversations: Conversation[];
  basePath: string;
  currentConvId?: string;
  newConvHref?: string;
}

export default function ConversationList({ conversations, basePath, currentConvId, newConvHref }: Props) {
  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-100">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <h2 className="font-semibold text-gray-900">Mesajlar</h2>
        {newConvHref && (
          <Link href={newConvHref} className="text-xs text-blue-600 hover:underline font-medium">
            + Yeni
          </Link>
        )}
      </div>

      {conversations.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-5 py-10">
          <MessageCircle size={32} className="text-gray-300 mb-3" />
          <p className="text-sm text-gray-400">Henüz mesaj yok.</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
          {conversations.map((conv) => (
            <Link
              key={conv.id}
              href={`${basePath}/${conv.id}`}
              className={`flex items-center gap-3 px-5 py-4 hover:bg-gray-50 transition-colors ${
                currentConvId === conv.id ? "bg-blue-50 border-r-2 border-blue-600" : ""
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm shrink-0">
                {conv.otherName[0]?.toUpperCase() ?? "?"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900 text-sm truncate">{conv.otherName}</span>
                  <span className="text-xs text-gray-400 shrink-0 ml-2">
                    {new Date(conv.lastMessageAt).toLocaleDateString("tr-TR")}
                  </span>
                </div>
                {conv.unreadCount > 0 && (
                  <span className="inline-block mt-0.5 bg-blue-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                    {conv.unreadCount}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
