import { BoardDetail } from '@components/BoardDetail';

interface BoardDetailPageProps {
  params: {
    id: string;
  };
}

export default function BoardDetailPage({ params }: BoardDetailPageProps) {
  const boardId = parseInt(params.id, 10);
  
  if (isNaN(boardId)) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          잘못된 게시글 ID입니다.
        </div>
      </div>
    );
  }

  return <BoardDetail boardId={boardId} />;
}
