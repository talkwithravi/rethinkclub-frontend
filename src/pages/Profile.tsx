import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { mockUsers, mockPosts } from '../data/mockData';

const Profile: React.FC = () => {
  const { userId } = useParams();
  const user = mockUsers.find(u => u.id === userId);
  const userPosts = mockPosts.filter(p => p.author.id === userId);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">User Not Found</h1>
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
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <img
              src={user.avatar}
              alt={user.username}
              className="w-24 h-24 rounded-full"
            />
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{user.username}</h1>
              <div className="flex flex-wrap gap-2 mb-4">
                {user.badges.map(badge => (
                  <span 
                    key={badge}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {badge}
                  </span>
                ))}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                <div>
                  <div className="font-medium">Member Since</div>
                  <div>{new Date(user.joinDate).toLocaleDateString()}</div>
                </div>
                <div>
                  <div className="font-medium">Posts</div>
                  <div>{user.postCount}</div>
                </div>
                <div>
                  <div className="font-medium">Reputation</div>
                  <div>{user.reputation}</div>
                </div>
                <div>
                  <div className="font-medium">Badges</div>
                  <div>{user.badges.length}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* User Posts */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Recent Activity</h2>
          
          {userPosts.length === 0 ? (
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <p className="text-gray-500">No posts yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {userPosts.map(post => (
                <div key={post.id} className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start">
                    <div className="flex-1">
                      <Link 
                        to={`/forums/post/${post.id}`}
                        className="text-lg font-medium text-gray-900 hover:text-primary-600"
                      >
                        {post.title}
                      </Link>
                      <p className="text-sm text-gray-500 mt-1">
                        Posted in {post.category} • {new Date(post.createdAt).toLocaleDateString()}
                      </p>
                      <div className="mt-3 flex items-center space-x-4 text-sm">
                        <span className="flex items-center text-gray-500">
                          <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                          {post.upvotes}
                        </span>
                        <span className="text-gray-500">
                          {post.commentCount} comments
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
