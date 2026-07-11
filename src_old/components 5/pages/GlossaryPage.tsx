import { useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, BookOpen, Network, Router, Cable, Shield, Layers, Eye } from 'lucide-react';
import { glossaryTerms, glossaryCategories, searchTerms, getTermsByCategory, getTermById } from '../../data/glossary';
import { Button } from '../common/Button';
import { ConceptHierarchyDiagram } from '../common/ConceptHierarchyDiagram';
import { TerminologyExample } from '../common/TerminologyExample';

export function GlossaryPage() {
  const location = useLocation();
  const initialTermId = (location.state as any)?.termId;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTerm, setSelectedTerm] = useState<string | null>(initialTermId || null);
  const [showDiagram, setShowDiagram] = useState(false);

  const filteredTerms = useMemo(() => {
    let terms = searchQuery ? searchTerms(searchQuery) : glossaryTerms;

    if (selectedCategory) {
      terms = terms.filter(term => term.category === selectedCategory);
    }

    return terms.sort((a, b) => a.term.localeCompare(b.term));
  }, [searchQuery, selectedCategory]);

  const selectedTermData = selectedTerm ? getTermById(selectedTerm) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-fw-wash via-fw-blue-light to-fw-wash">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-gradient-to-br from-fw-cobalt-700 to-fw-blue-700 rounded-xl shadow-lg">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-fw-heading">Network Glossary</h1>
              <p className="text-fw-body mt-1">Understanding key networking concepts and terminology</p>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-fw-bodyLight" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search terms, definitions, and examples..."
                className="w-full pl-12 pr-4 py-3 bg-fw-base border border-fw-secondary rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-fw-active focus:border-transparent text-sm"
              />
            </div>
            <Button
              variant={showDiagram ? 'primary' : 'secondary'}
              onClick={() => setShowDiagram(!showDiagram)}
              className="flex items-center gap-2 whitespace-nowrap"
            >
              <Eye className="h-4 w-4" />
              {showDiagram ? 'Hide' : 'View'} Hierarchy
            </Button>
          </div>
        </div>

        {showDiagram && (
          <div className="mb-8 bg-fw-base rounded-xl border-2 border-fw-secondary shadow-lg p-6">
            <ConceptHierarchyDiagram />
          </div>
        )}

        <div className="mb-8">
          <TerminologyExample />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`p-4 rounded-xl border-2 transition-all duration-200 ${
              selectedCategory === null
                ? 'border-fw-active bg-fw-blue-light shadow-md'
                : 'border-fw-secondary bg-fw-base hover:border-fw-bodyLight hover:shadow-sm'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${selectedCategory === null ? 'bg-fw-blue-100' : 'bg-fw-neutral'}`}>
                <BookOpen className={`h-5 w-5 ${selectedCategory === null ? 'text-fw-link' : 'text-fw-body'}`} />
              </div>
              <div className="text-left">
                <div className={`font-semibold text-sm ${selectedCategory === null ? 'text-fw-heading' : 'text-fw-heading'}`}>
                  All Terms
                </div>
                <div className="text-xs text-fw-body">
                  {glossaryTerms.length} terms
                </div>
              </div>
            </div>
          </button>

          {Object.entries(glossaryCategories).map(([key, category]) => {
            const Icon = category.icon;
            const categoryTerms = getTermsByCategory(key);
            const isSelected = selectedCategory === key;

            return (
              <button
                key={key}
                onClick={() => setSelectedCategory(isSelected ? null : key)}
                className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${isSelected ? 'bg-blue-100' : 'bg-gray-100'}`}>
                    <Icon className={`h-5 w-5 ${isSelected ? 'text-blue-600' : 'text-gray-600'}`} />
                  </div>
                  <div className="text-left">
                    <div className={`font-semibold text-sm ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                      {category.name}
                    </div>
                    <div className="text-xs text-gray-600">
                      {categoryTerms.length} terms
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-2">
            {filteredTerms.map((term) => {
              const Icon = term.icon;
              const isSelected = selectedTerm === term.id;

              return (
                <button
                  key={term.id}
                  onClick={() => setSelectedTerm(term.id)}
                  className={`w-full p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                    isSelected
                      ? 'border-blue-600 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-md scale-[1.02]'
                      : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {Icon && (
                      <div className={`flex-shrink-0 p-2 rounded-lg ${isSelected ? 'bg-blue-100' : 'bg-gray-100'}`}>
                        <Icon className={`h-5 w-5 ${isSelected ? 'text-blue-600' : 'text-gray-600'}`} />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className={`font-semibold text-sm mb-1 ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                        {term.term}
                      </div>
                      <div className="text-xs text-gray-600 line-clamp-2">
                        {term.shortDefinition}
                      </div>
                      <div className="mt-2">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                          isSelected ? 'bg-blue-200 text-blue-800' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {term.category}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}

            {filteredTerms.length === 0 && (
              <div className="text-center py-12">
                <Search className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No terms found</p>
                <p className="text-gray-400 text-xs mt-1">Try a different search query</p>
              </div>
            )}
          </div>

          <div className="lg:col-span-2">
            {selectedTermData ? (
              <div className="bg-white rounded-xl border-2 border-gray-200 shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
                  <div className="flex items-start gap-4">
                    {selectedTermData.icon && (
                      <div className="flex-shrink-0 p-3 bg-white bg-opacity-20 rounded-xl backdrop-blur-sm">
                        <selectedTermData.icon className="h-8 w-8" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold mb-2">{selectedTermData.term}</h2>
                      <p className="text-blue-100 text-sm uppercase tracking-wide font-medium">
                        {selectedTermData.category}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2 uppercase tracking-wide">
                      Quick Definition
                    </h3>
                    <p className="text-base text-gray-700 leading-relaxed">
                      {selectedTermData.shortDefinition}
                    </p>
                  </div>

                  <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />

                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2 uppercase tracking-wide">
                      Detailed Explanation
                    </h3>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {selectedTermData.detailedDefinition}
                    </p>
                  </div>

                  {selectedTermData.example && (
                    <>
                      <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />

                      <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-xl p-5 border border-blue-100">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 p-2 bg-white rounded-lg shadow-sm">
                            <Network className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="text-sm font-semibold text-blue-900 mb-2">
                              Real-World Example
                            </h3>
                            <p className="text-sm text-blue-800 leading-relaxed italic">
                              {selectedTermData.example}
                            </p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {selectedTermData.visualAid === 'hierarchy' && (
                    <>
                      <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />

                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">
                          Visual Hierarchy
                        </h3>
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
                          <div className="space-y-4">
                            <div className="flex items-center gap-3 p-4 bg-white rounded-lg border-2 border-blue-300 shadow-sm">
                              <Network className="h-6 w-6 text-blue-600 flex-shrink-0" />
                              <div>
                                <div className="font-semibold text-sm text-gray-900">Connection</div>
                                <div className="text-xs text-gray-600">Top-level network infrastructure</div>
                              </div>
                            </div>

                            <div className="ml-8 flex items-center gap-2">
                              <div className="w-px h-8 bg-gradient-to-b from-blue-400 to-transparent" />
                            </div>

                            <div className="ml-8 flex items-center gap-3 p-4 bg-white rounded-lg border-2 border-green-300 shadow-sm">
                              <Router className="h-6 w-6 text-green-600 flex-shrink-0" />
                              <div>
                                <div className="font-semibold text-sm text-gray-900">Cloud Router</div>
                                <div className="text-xs text-gray-600">Virtual routing node</div>
                              </div>
                            </div>

                            <div className="ml-16 flex items-center gap-2">
                              <div className="w-px h-8 bg-gradient-to-b from-green-400 to-transparent" />
                            </div>

                            <div className="ml-16 flex items-center gap-3 p-4 bg-white rounded-lg border-2 border-purple-300 shadow-sm">
                              <Cable className="h-6 w-6 text-purple-600 flex-shrink-0" />
                              <div>
                                <div className="font-semibold text-sm text-gray-900">Link (VLAN)</div>
                                <div className="text-xs text-gray-600">Virtual network segment</div>
                              </div>
                            </div>

                            <div className="ml-24 flex items-center gap-2">
                              <div className="w-px h-8 bg-gradient-to-b from-purple-400 to-transparent" />
                            </div>

                            <div className="ml-24 flex items-center gap-3 p-4 bg-white rounded-lg border-2 border-orange-300 shadow-sm">
                              <Shield className="h-6 w-6 text-orange-600 flex-shrink-0" />
                              <div>
                                <div className="font-semibold text-sm text-gray-900">VNF (Virtual Network Function)</div>
                                <div className="text-xs text-gray-600">Network services (firewall, SD-WAN, etc.)</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {selectedTermData.relatedTerms && selectedTermData.relatedTerms.length > 0 && (
                    <>
                      <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />

                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">
                          Related Terms
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedTermData.relatedTerms.map(relatedId => {
                            const relatedTerm = getTermById(relatedId);
                            return relatedTerm ? (
                              <button
                                key={relatedId}
                                onClick={() => setSelectedTerm(relatedId)}
                                className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-br from-gray-50 to-gray-100 hover:from-blue-50 hover:to-blue-100 border border-gray-200 hover:border-blue-300 rounded-lg transition-all duration-200 group"
                              >
                                {relatedTerm.icon && (
                                  <relatedTerm.icon className="h-4 w-4 text-gray-600 group-hover:text-blue-600" />
                                )}
                                <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">
                                  {relatedTerm.term}
                                </span>
                              </button>
                            ) : null;
                          })}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 h-full flex items-center justify-center p-12">
                <div className="text-center">
                  <div className="inline-flex p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full mb-4">
                    <BookOpen className="h-12 w-12 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Select a term to learn more
                  </h3>
                  <p className="text-sm text-gray-600 max-w-xs mx-auto">
                    Click on any term from the list to view its detailed explanation, examples, and related concepts
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
