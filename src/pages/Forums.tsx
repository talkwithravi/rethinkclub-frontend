import React from 'react';
import { Link } from 'react-router-dom';
import { mockCategories, mockPosts } from '../data/mockData';

const Forums: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Community Forums</h1>
        
        {/* Categories Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Discussion Categories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {mockCategories.map((category) => (
              <Link
                key={category.id}
                to={`/forums/category/${category.id}`}
                className={`p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow ${category.color}`}
              >
                <div className="flex items-center">
                  <span className="text-2xl mr-3">{category.icon}</span>
                  <div>
                    <h3 className="font-medium text-gray-900">{category.name}</h3>
                    <p className="text-sm text-gray-600">{category.postCount} posts</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Discussions */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Recent Discussions</h2>
          <div className="space-y-4">
            {mockPosts.map((post) => (
              <div key={post.id} className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start">
                  <img
                    src={post.author.avatar}
                    alt={post.author.username}
                    className="w-10 h-10 rounded-full mr-4"
                  />
                  <div className="flex-1">
                    <Link 
                      to={`/forums/post/${post.id}`}
                      className="text-lg font-medium text-gray-900 hover:text-primary-600"
                    >
                      {post.title}
                    </Link>
                    <p className="text-sm text-gray-500 mt-1">
                      Posted by {post.author.username} in {post.category}
                    </p>
                    <div className="flex items-center mt-3 text-sm text-gray-500 space-x-4">
                      <span>{post.commentCount} comments</span>
                      <span>{post.upvotes} upvotes</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Forums;
