import { setGlobalOptions } from "firebase-functions";
import { onRequest } from "firebase-functions/https";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import cors from "cors";

setGlobalOptions({ maxInstances: 10 });
initializeApp();
const db = getFirestore();
const corsHandler = cors({ origin: true });

export const getBook = onRequest(async (request, response) => {
	corsHandler(request, response, async () => {
		try {
			const isbn = request.query.isbn;

			const snapshot = await db.collection("books").where("isbn", "==", isbn).get();

			const docs: any[] = [];
			snapshot.forEach(doc => docs.push(doc.data()));

			// Already in database - return the data
			if (docs.length > 0) {
				response.json(docs[0] as any);
				return;
			}

			let [openLibraryResponse, googleResponse] = await Promise.all([
				fetch(`https://openlibrary.org/isbn/${isbn}.json`),
				fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`),
			]);
			let [openLibraryData, googleData] = await Promise.all([
				openLibraryResponse.json(),
				googleResponse.json(),
			]);

			const work = openLibraryData.works[0].key;
			const [workResponse, editionsResponse] = await Promise.all([
				fetch(`https://openlibrary.org${work}.json`),
				fetch(`https://openlibrary.org${work}/editions.json`),
			]);
			const [workData, editionsData] = await Promise.all([
				workResponse.json(),
				editionsResponse.json(),
			]);

			googleData = googleData.items?.[0].volumeInfo;

			const book = {
				title: openLibraryData.title ?? "",
				isbn: editionsData.entries?.[0]?.[0]?.isbn_13?.[0] ?? isbn,
				cover: workData.covers?.[0]
					? `https://covers.openlibrary.org/b/id/${workData.covers[0]}-L.jpg`
					: `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`,
				backupCover: googleData?.imageLinks?.thumbnail ?? "",
				pageCount: openLibraryData.number_of_pages ?? 0,
				genres: workData.subjects ?? [],
				description: googleData?.description ?? workData.description ?? "",
				publishers: openLibraryData.publishers ?? [],
				publishDate: openLibraryData.publish_date ?? "",
				characters: workData.subject_people ?? [],
				authorKey:
					(
						openLibraryData.authors?.[0]?.key ?? workData.authors?.[0]?.author?.key
					)?.match(/\/authors\/(.+)/)?.[1] ?? "",
			};

			const bookDoc = db.collection("books").doc();
			bookDoc.set({ ...book, id: bookDoc.id });

			response.json(book);
			return;
		} catch (error) {
			response.statusCode = 500;
			response.json({ error: `${error}` });
			return;
		}
	});
});
