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

const encoders = [
	/* TODO Fix italic formatting breaking URLs.
	{ // Italic
		regex: new RegExp("(_|/)([^_]*)(_|/)", "g"),
		replacement: "\x1D$1\x1D",
	},*/ { // Bold
		regex: new RegExp("\\*([^*]*)\\*", "g"),
		replacement: "\x02$1\x02",
	}, { // Underline
		regex: new RegExp("__([^~]*)__", "g"),
		replacement: "\x1F$1\x1F",
	}, { // Background & Foreground color
		regex: new RegExp("c(1[0-5]|[0-9])>([^<]*)<", "g"),
		replacement: "\x03$1$2",
	}, { // Foreground color only
		regex: new RegExp("c(1[0-5]|[0-9]),(1[0-5]|[0-9])>([^<]*)<", "g"),
		replacement: "\x03$1,$2$3",
	},
]

const decoders = [
	{ // Italic
		regex: new RegExp("\x1D([^\x1D]*)?\x1D?", "g"),
		replacement: "<i>$1</i>",
	}, { // Bold
		regex: new RegExp("\x02([^\x02]*)?\x02?", "g"),
		replacement: "<b>$1</b>",
	}, { // Underline
		regex: new RegExp("\x1F([^\x1F]*)?\x1F?", "g"),
		replacement: "<u>$1</u>",
	}, { // Monospace
		regex: new RegExp("`([^`]*)`", "g"),
		replacement: "<tt>$1</tt>",
	}, { // Background & Foreground color
		regex: new RegExp(
				"\x03(1[0-5]|[0-9]),(1[0-5]|[0-9])([^\x03]*)?\x03?", "g"),
		replacement: "<span style='color: $1; background-color: $2;'>$3</span>",
	}, { // Foreground color only
		regex: new RegExp("\x03(1[0-5]|[0-9])([^\x03]*)?\x03?", "g"),
		replacement: "<span style='color: $1;'>$2</span>",
	},
]

/**
 * Escape HTML special characters.
 *
 * @param {string} str The string to escape.
 * @returns {string} A escaped string.
 */
function escapeHtml(str) {
	return str
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&apos;")
}

/**
 * Encode human-writable formatting into IRC format.
 *
 * @param {string} str The string to encode.
 * @returns {string} A string with the same formattings in IRC encoding.
 */
function encodeIRC(str) {
	for (const enc of encoders) {
		str = str.replace(enc.regex, enc.replacement)
	}
	return str
}

/**
 * Decode IRC-encoded formattings into HTML.
 *
 * @param {string} str The string to decode.
 * @returns {string} A string with the same formattings as HTML.
 */
function decodeIRC(str) {
	for (const dec of decoders) {
		str = str.replace(dec.regex, dec.replacement)
	}
	return str
}

module.exports = { escapeHtml, encodeIRC, decodeIRC }
