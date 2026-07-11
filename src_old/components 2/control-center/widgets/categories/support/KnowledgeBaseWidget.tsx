import { Book, Search, ChevronRight } from 'lucide-react';

export function KnowledgeBaseWidget() {
  const articles = [
    {
      id: '1',
      title: 'Getting Started with Direct Connect',
      category: 'Guides',
      views: 1234
    },
    {
      id: '2',
      title: 'Troubleshooting Connection Issues',
      category: 'Troubleshooting',
      views: 856
    },
    {
      id: '3',
      title: 'Security Best Practices',
      category: 'Security',
      views: 567
    }
  ];

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <input
          type="text"
          placeholder="Search knowledge base..."
          className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="space-y-2">
        {articles.map((article) => (
          <button
            key={article.id}
            className="w-full flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
          >
            <div className="flex items-center">
              <Book className="h-4 w-4 text-gray-400 mr-2" />
              <div className="text-left">
                <div className="text-sm font-medium text-gray-900 group-hover:text-blue-600">
                  {article.title}
                </div>
                <div className="text-xs text-gray-500">
                  {article.category} • {article.views.toLocaleString()} views
                </div>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-blue-500" />
          </button>
        ))}
      </div>

      <button className="w-full px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
        Browse All Articles
      </button>
    </div>
  );
}