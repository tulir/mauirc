// mauIRC - The original mauIRC web frontend
// Copyright (C) 2016 Tulir Asokan
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

/**
 * Return the new object if it exists and the old one if the new one doesn't
 * exist.
 *
 * @private
 * @param   {Object} neww The new object.
 * @param   {Object} old  The old object.
 * @returns {Object}      Basically {@linkplain neww ? neww : old}.
 */
function changeOrKeep(neww, old) {
	return neww || old
}

/**
 * Autocomplete.
 *
 * @param   {Object|string} text The whole text OR an object containing all
 *                               parameters.
 * @param   {number}   wordStart The beginning of the word the caret is on.
 * @param   {number}   caretPos  The caret position.
 * @param   {string[]|function} completions A list of possible completions.
 * @param   {string}   [prefix]  The prefix for all completions.
 * @param   {string}   [extra]   Extra character for after the completed word.
 * @returns {string}             The autocompleted string, or undefined if no
 *                               completions found.
 */
function complete(text, wordStart, caretPos, completions, prefix, extra) {
	if (typeof text === "object") {
		wordStart = text.wordStart
		caretPos = text.caretPos
		completions = text.completions
		prefix = text.prefix
		extra = text.extra
		text = text.text
	}
	prefix = changeOrKeep(prefix, "")
	extra = changeOrKeep(extra, "")

	if (wordStart === caretPos) {
		return undefined
	}

	const word = text.substr(wordStart, caretPos)
	if (typeof completions === "function") {
		const data = completions(word, wordStart, caretPos)
		if (Array.isArray(data)) {
			completions = data
		} else {
			completions = data.completions
			prefix = changeOrKeep(data.prefix, prefix)
			extra = changeOrKeep(data.extra, extra)
		}
	}

	completions = spliceCompletions(word, prefix, completions)

	const preWord = wordStart === 0 ? "" : `${text.substr(0, wordStart - 1)} `
	const postWord = text.substr(caretPos)

	if (completions.length === 1) {
		return preWord + prefix + completions[0] + extra + postWord
	} else if (completions.length > 1) {
		const chars = findPartialCompletion(completions)
		if (chars > word.length > 0) {
			return preWord
					+ prefix
					+ completions[0].substr(0, chars).toLowerCase()
					+ postWord
		}
	}
	return undefined
}

/**
 * Splice invalid completions out of the completions array.
 *
 * @param   {string}   word        The word to complete.
 * @param   {string}   prefix      The prefix for all possible completions.
 * @param   {string[]} completions All completions.
 * @returns {string[]}             The valid completions.
 */
function spliceCompletions(word, prefix, completions) {
	for (let i = completions.length - 1; i >= 0; i--) {
		if (!(prefix + completions[i]).toLowerCase()
				.startsWith(word.toLowerCase())) {
			completions.splice(i, 1)
		}
	}
	return completions
}

/**
 * Get the number of characters that the possible completions have in common.
 *
 * @param  {string[]} completions The array of possible completions.
 * @returns {number}              The number of characters the strings have in
 *                                common from the beginning.
 */
function findPartialCompletion(completions) {
	let chars = 0
	Outer: for (;;) {
		let char = ""
		for (const choice of completions) {
			if (chars > choice.length) {
				break Outer
			}
			if (char.length === 0) {
				char = choice.charAt(chars).toLowerCase()
			} else if (choice.charAt(chars).toLowerCase() !== char) {
				break Outer
			}
		}
		chars++
	}
	return chars
}

module.exports = { complete, spliceCompletions, findPartialCompletion }
