import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { mockPosts, mockComments } from '../data/mockData';

const PostView: React.FC = () => {
  const { postId } = useParams();
  const post = mockPosts.find(p => p.id === postId);
  const comments = mockComments.filter(c => c.postId === postId);

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Post Not Found</h1>
          <Link 
            to="/forums" 
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Back to Forums
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Post Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <img
              src={post.author.avatar}
              alt={post.author.username}
              className="w-12 h-12 rounded-full mr-4"
            />
            <div>
              <Link 
                to={`/profile/${post.author.id}`}
                className="font-medium text-gray-900 hover:text-primary-600"
              >
                {post.author.username}
              </Link>
              <div className="text-sm text-gray-500">
                Posted {new Date(post.createdAt).toLocaleDateString()} in {post.category}
              </div>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">{post.title}</h1>
          
          {post.isPinned && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 mb-4">
              Pinned Post
            </span>
          )}

          <div className="flex items-center space-x-4 text-sm text-gray-500 mb-6">
            <span className="flex items-center">
              <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {post.upvotes} upvotes
            </span>
            <span>{post.commentCount} comments</span>
          </div>
        </div>

        {/* Post Content */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
          <div className="prose max-w-none">
            <p className="whitespace-pre-line">{post.content}</p>
          </div>

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {post.tags.map(tag => (
                <span 
                  key={tag}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Comments Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Comments ({comments.length})</h2>
          
          {comments.length === 0 ? (
            <p className="text-gray-500">No comments yet. Be the first to comment!</p>
          ) : (
            <div className="space-y-6">
              {comments.map(comment => (
                <div key={comment.id} className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="flex items-start">
                    <img
                      src={comment.author.avatar}
                      alt={comment.author.username}
                      className="w-10 h-10 rounded-full mr-4"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <Link 
                          to={`/profile/${comment.author.id}`}
                          className="font-medium text-gray-900 hover:text-primary-600"
                        >
                          {comment.author.username}
                        </Link>
                        <span className="text-sm text-gray-500">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-700 whitespace-pre-line">{comment.content}</p>
                      <div className="mt-3 flex items-center space-x-4 text-sm">
                        <button className="text-gray-500 hover:text-primary-600 flex items-center">
                          <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                          {comment.upvotes}
                        </button>
                        <button className="text-gray-500 hover:text-primary-600">
                          Reply
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Comment Form */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Add your comment</h3>
          <form>
            <div className="mb-4">
              <textarea
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Share your thoughts..."
              />
            </div>
            <button
              type="submit"
              className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium"
            >
              Post Comment
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PostView;
