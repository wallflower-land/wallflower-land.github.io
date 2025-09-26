<script>
	import Page from "../../components/layout/Page.svelte";
	import Link from "../../components/util/Link.svelte";
</script>

<Page class="about" header="Terms of Service">
	<p>Terms of Service last udpated on 9/26/25</p>

	<h2>Account Responsibilities</h2>

	<h2>User Content</h2>

	<h2>Complaints &amp; Appeals</h2>

	<h2>Termination</h2>

	<h2>Warranty Disclaimer</h2>

	<h2>Indemnification</h2>

	<h2>Limitation of Liability</h2>

	<h2>Dispute Resolution</h2>

	<h2>Updates to Terms</h2>

	<p>
		We may update these Terms periodically. We will always post the revised version here and we will
		notify you through the App, website, or other communication channel if we make any material changes.
	</p>

	<p>
		It's your responsibility to review the Terms regularly. By continuing to use wallflower.land Social
		after any update, you agree to the revised Terms. If you do not agree to the changes, you must stop
		using wallflower.land.
	</p>

	<h2>Intellectual Property</h2>

	<h2>General Terms</h2>

	<h2>Contact Us</h2>

	<p>
		If you have any questions about these Terms or Wallflower LLC, please contact Wallflower LLC at
		<Link href="mailto:support@wallflower.land">support@wallflower.land</Link>.
	</p>

	<h2>App Store Terms</h2>

	<p>
		The Apple App Store and Google Play (each, an "App Provider") require us to tell you that the
		following additional terms apply if you download or access wallflower.land through an App Provider:
	</p>

	<ul>
		<li>
			These Terms are between you and wallflower.land—not the App Provider. The App Provider has no
			responsibility for wallflower.land or its content.
		</li>
		<li>
			wallflower.land is solely responsible for the App, including any claims, losses, liabilities, or
			expenses arising from its failure to meet any applicable warranties. If the App does not conform
			to a warranty, you may notify the App Provider—but, to the maximum extent permitted by law, the
			App Provider will have no further warranty obligations.
		</li>
		<li>The App Provider is not obligated to provide maintenance or support services for the App.</li>
		<li>
			The App Provider is not responsible for addressing any claims you or third parties may have in
			connection with the App, including product liability, legal compliance, or intellectual property
			infringement.
		</li>
		<li>
			If a third party claims that your use of the App infringes their intellectual property rights,
			wallflower.land—not the App Provider—is solely responsible for handling that claim under these
			Terms.
		</li>
		<li>
			The App Provider and its affiliates are third-party beneficiaries of these Terms and may enforce
			them accordingly.
		</li>
		<li>
			You must comply with all applicable third-party terms of service when using the wallflower.land
			App.
		</li>
	</ul>
</Page>

<style>
	:global(.about) {
		padding: 2rem;
		padding-top: 4rem;
		font-size: 0.9rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;

		p {
			color: var(--overlay-1);
		}
	}

	h2:not(.wallflower) {
		color: var(--subtext-1);
		margin-bottom: -0.5rem;
		margin-top: 0.5rem;
	}

	ul {
		margin-left: 1rem;

		li {
			color: var(--overlay-1);
			margin-bottom: 0.5rem;
		}
	}
</style>
