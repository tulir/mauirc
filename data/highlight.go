// mauIRC - The original mauIRC web frontend
// Copyright (C) 2016 Tulir Asokan

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

// Package data contains the session data storage system
package data

import (
	"regexp"
	"strings"
)

// Highlight is a highlight
type Highlight interface {
	Match(str string) *HighlightMatch
	String() string
}

// HighlightMatch is a match
type HighlightMatch struct {
	Index  int
	Length int
}

// RegexHighlight is a highlight type that checks for matches with regex
type RegexHighlight struct {
	expr   *regexp.Regexp
	source string
}

// StringHighlight is a highlight type that checks for case-insensitive string matches
type StringHighlight struct {
	lower  string
	len    int
	source string
}

// CreateRegexHighlight creates a regex highlight
func CreateRegexHighlight(val string) Highlight {
	return RegexHighlight{expr: (regexp.MustCompile(val)), source: val}
}

// CreateStringHighlight creates a string highlight
func CreateStringHighlight(val string) Highlight {
	return StringHighlight{lower: strings.ToLower(val), len: len(val), source: val}
}

// Match gets all the regex matches
func (hl RegexHighlight) Match(str string) *HighlightMatch {
	match := hl.expr.FindStringIndex(str)
	if match != nil {
		return &HighlightMatch{Index: match[0], Length: match[1] - match[0]}
	}
	return nil
}

// String turns this into a string
func (hl RegexHighlight) String() string {
	return ":" + hl.source
}

// Match gets all the case-insensitive string matches
func (hl StringHighlight) Match(str string) *HighlightMatch {
	index := strings.Index(hl.lower, strings.ToLower(str))
	if index != -1 {
		return &HighlightMatch{Index: index, Length: hl.len}
	}
	return nil
}

// String returns the source
func (hl StringHighlight) String() string {
	return hl.source
}
