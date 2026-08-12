(function (root, factory) {
    const selectedAssetPathRules =
        typeof module === "object" && module.exports
            ? require("./selected-asset-paths.js")
            : root?.SelectedAssetPaths;
    const api = factory(selectedAssetPathRules);

    if (typeof module === "object" && module.exports) {
        module.exports = api.node;
    }
    if (root) {
        root.PlateCatalog = api.browser;
    }
})(typeof window !== "undefined" ? window : globalThis, function (selectedAssetPathRules) {
    if (!selectedAssetPathRules) {
        throw new Error("SelectedAssetPaths is required before plate-catalog.js");
    }

    const PHOTO_STATUSES = Object.freeze({
        SATISFIED: "satisfied",
        MISSING: "missing",
        NEEDS_UPGRADE: "needs-upgrade",
    });

    function hasOwn(object, key) {
        return Object.prototype.hasOwnProperty.call(object, key);
    }

    const PHOTO_STATUS_DETAILS = Object.freeze({
        [PHOTO_STATUSES.SATISFIED]: {
            badge: null,
            checklist: null,
            placeholder: null,
        },
        [PHOTO_STATUSES.MISSING]: {
            badge: null,
            checklist: {
                title: "Left to Find",
                emptyMessage: "Collection is complete! \u{1F389}",
            },
            placeholder: {
                ariaSuffix: "photo pending",
                stripDetail: "No photo on file",
                statusText: "Pending",
                stampText: "Pending",
            },
        },
        [PHOTO_STATUSES.NEEDS_UPGRADE]: {
            badge: {
                text: "LOW QUALITY",
                ariaLabel: "Low quality photo",
            },
            checklist: {
                title: "Needs Better Photo",
                emptyMessage: "No upgrades needed. \u{1F44D}",
            },
            placeholder: null,
        },
    });

    const CHECKLIST_PHOTO_STATUSES = Object.freeze([
        PHOTO_STATUSES.MISSING,
        PHOTO_STATUSES.NEEDS_UPGRADE,
    ]);

    function photoStatusDetails(status) {
        const details = PHOTO_STATUS_DETAILS[status];
        if (!details) throw new Error(`Unknown photoStatus: ${status}`);
        return details;
    }

    function photoStatusPresentationFor(variant, category) {
        const details = photoStatusDetails(variant.photoStatus);
        const placeholder = details.placeholder;

        return Object.freeze({
            status: variant.photoStatus,
            badge: details.badge,
            missingPlaceholder: placeholder
                ? Object.freeze({
                      ariaLabel: `${imageAlt(variant)} \u2014 ${placeholder.ariaSuffix}`,
                      stripDetail: placeholder.stripDetail,
                      plateTitle: variant.title,
                      categoryTitle: category.title,
                      statusText: placeholder.statusText,
                      stampText: placeholder.stampText,
                  })
                : null,
        });
    }

    function checklistGroupsFor(status, sourceCategories) {
        return sourceCategories
            .map((category) => ({
                category,
                plates: category.plates.filter(
                    (variant) => variant.photoStatus === status
                ),
            }))
            .filter((group) => group.plates.length > 0);
    }

    const VARIANT_KINDS = Object.freeze({
        PLATE: "plate",
        EMBLEM: "emblem",
    });

    const STICKER_STYLES = Object.freeze(["black", "blue", "green", "red"]);
    const DEFAULT_STICKER_FOOT = "WASHINGTON";
    const CATEGORY_FRAGMENT_OVERRIDES = Object.freeze({
        tribal_self_issued: "trb-self",
        tribal: "trb-wa",
    });

    const categories = [
        {
            id: "collector_vehicles",
            title: "Collector Vehicles",
            sticker: { style: "green", mark: "CLV" },
            plates: [
                {
                    id: "collector-vehicle",
                    title: "Collector Vehicle",
                    photoStatus: PHOTO_STATUSES.SATISFIED,
                    asset: "collector_vehicles/collector_vehicle.jpg",
                },
                {
                    id: "horseless-carriage",
                    title: "Horseless Carriage",
                    photoStatus: PHOTO_STATUSES.SATISFIED,
                    asset: "collector_vehicles/horseless_carriage.jpg",
                },
                {
                    id: "restored",
                    title: "Restored",
                    photoStatus: PHOTO_STATUSES.SATISFIED,
                    asset: "collector_vehicles/restored_82_delorean.jpg",
                },
            ],
        },
        {
            id: "colleges",
            title: "Colleges and Universities",
            sticker: { style: "blue", mark: "UNI" },
            plates: [
                {
                    id: "central-washington-university",
                    title: "Central Washington University",
                    photoStatus: PHOTO_STATUSES.NEEDS_UPGRADE,
                    asset: "colleges/cwu.jpg",
                },
                {
                    id: "eastern-washington-university",
                    title: "Eastern Washington University",
                    photoStatus: PHOTO_STATUSES.SATISFIED,
                    asset: "colleges/ewu.jpg",
                },
                {
                    id: "evergreen-state-college",
                    title: "Evergreen State College",
                    photoStatus: PHOTO_STATUSES.SATISFIED,
                    asset: "colleges/esc_2.jpg",
                },
                {
                    id: "gonzaga-university",
                    title: "Gonzaga University",
                    photoStatus: PHOTO_STATUSES.SATISFIED,
                    asset: "colleges/gonzaga.jpg",
                },
                {
                    id: "seattle-university",
                    title: "Seattle University",
                    photoStatus: PHOTO_STATUSES.MISSING,
                    asset: null,
                },
                {
                    id: "university-of-washington",
                    title: "University of Washington",
                    photoStatus: PHOTO_STATUSES.SATISFIED,
                    asset: "colleges/uw.jpg",
                },
                {
                    id: "washington-state-university",
                    title: "Washington State University",
                    photoStatus: PHOTO_STATUSES.SATISFIED,
                    asset: "colleges/wsu.jpg",
                },
                {
                    id: "western-washington-university",
                    title: "Western Washington University",
                    photoStatus: PHOTO_STATUSES.NEEDS_UPGRADE,
                    asset: "colleges/wwu.jpg",
                },
            ],
        },
        {
            id: "first_responders",
            title: "First Responders",
            sticker: { style: "red", mark: "911" },
            plates: [
                {
                    id: "law-enforcement-memorial",
                    title: "Law Enforcement Memorial",
                    photoStatus: PHOTO_STATUSES.SATISFIED,
                    asset: "first_responders/lem.jpg",
                },
                {
                    id: "professional-firefighter",
                    title: "Professional Firefighter",
                    photoStatus: PHOTO_STATUSES.SATISFIED,
                    asset: "first_responders/pro_ff.jpg",
                },
                {
                    id: "volunteer-firefighter",
                    title: "Volunteer Firefighter",
                    photoStatus: PHOTO_STATUSES.SATISFIED,
                    asset: "first_responders/vol_ff.jpg",
                },
            ],
        },
        {
            id: "mil",
            title: "Military and Veterans",
            sticker: { style: "green", mark: "MIL" },
            plates: [
                {
                    id: "988-prevent-veteran-suicide",
                    title: "988 - Prevent Veteran Suicide",
                    photoStatus: PHOTO_STATUSES.SATISFIED,
                    variantKind: VARIANT_KINDS.EMBLEM,
                    asset: "mil/988.jpg",
                },
                {
                    id: "air-force",
                    title: "Air Force",
                    photoStatus: PHOTO_STATUSES.SATISFIED,
                    asset: "mil/air_force.jpg",
                },
                {
                    id: "army",
                    title: "Army",
                    photoStatus: PHOTO_STATUSES.NEEDS_UPGRADE,
                    asset: "mil/army.jpg",
                },
                {
                    id: "coast-guard",
                    title: "Coast Guard",
                    photoStatus: PHOTO_STATUSES.SATISFIED,
                    asset: "mil/coast_guard.jpg",
                },
                {
                    id: "disabled-american-veteran",
                    title: "Disabled American Veteran",
                    photoStatus: PHOTO_STATUSES.MISSING,
                    asset: null,
                },
                {
                    id: "former-prisoner-of-war",
                    title: "Former Prisoner of War",
                    photoStatus: PHOTO_STATUSES.MISSING,
                    asset: null,
                },
                {
                    id: "gold-star",
                    title: "Gold Star",
                    photoStatus: PHOTO_STATUSES.SATISFIED,
                    asset: "mil/gold_star.jpg",
                },
                {
                    id: "marine-corps",
                    title: "Marine Corps",
                    photoStatus: PHOTO_STATUSES.SATISFIED,
                    asset: "mil/marine_corps.jpg",
                },
                {
                    id: "medal-of-honor",
                    title: "Medal of Honor",
                    photoStatus: PHOTO_STATUSES.MISSING,
                    asset: null,
                },
                {
                    id: "military-affiliate-radio-system",
                    title: "Military Affiliate Radio System",
                    photoStatus: PHOTO_STATUSES.MISSING,
                    asset: null,
                },
                {
                    id: "national-guard",
                    title: "National Guard",
                    photoStatus: PHOTO_STATUSES.NEEDS_UPGRADE,
                    asset: "mil/nat_guard_ribbon.jpg",
                },
                {
                    id: "navy",
                    title: "Navy",
                    photoStatus: PHOTO_STATUSES.MISSING,
                    asset: null,
                },
                {
                    id: "purple-heart",
                    title: "Purple Heart",
                    photoStatus: PHOTO_STATUSES.SATISFIED,
                    asset: "mil/purple_heart_2.jpg",
                },
                {
                    id: "veteran-military-service-award-emblems",
                    title: "Veteran Service emblems",
                    photoStatus: PHOTO_STATUSES.NEEDS_UPGRADE,
                    variantKind: VARIANT_KINDS.EMBLEM,
                    selectedAssetAltText: "Veteran Service emblems",
                    asset: "mil/nat_guard_ribbon.jpg",
                },
            ],
        },
        {
            id: "orgs",
            title: "Organizations",
            sticker: { style: "black", mark: "ORG" },
            plates: [
                {
                    id: "4-h",
                    title: "4-H",
                    photoStatus: PHOTO_STATUSES.SATISFIED,
                    asset: "orgs/4h.jpg",
                },
                {
                    id: "breast-cancer",
                    title: "Breast Cancer",
                    photoStatus: PHOTO_STATUSES.SATISFIED,
                    asset: "orgs/breast_cancer.jpg",
                },
                {
                    id: "ffa-foundation",
                    title: "FFA Foundation",
                    photoStatus: PHOTO_STATUSES.MISSING,
                    asset: null,
                },
                {
                    id: "fred-hutchinson-cancer-center",
                    title: "Fred Hutchinson Cancer Center",
                    photoStatus: PHOTO_STATUSES.SATISFIED,
                    asset: "orgs/fred_hutch.jpg",
                },
                {
                    id: "helping-kids-speak",
                    title: "Helping Kids Speak (Freemason)",
                    photoStatus: PHOTO_STATUSES.SATISFIED,
                    asset: "orgs/freemason_2.jpg",
                },
                {
                    id: "jp-patches-pal",
                    title: "J.P. Patches Pal",
                    photoStatus: PHOTO_STATUSES.SATISFIED,
                    asset: "orgs/jp_patches.jpg",
                },
                {
                    id: "keep-kids-safe",
                    title: "Keep Kids Safe",
                    photoStatus: PHOTO_STATUSES.SATISFIED,
                    asset: "orgs/kids_safe.jpg",
                },
                {
                    id: "washington-apple-commission",
                    title: "Washington Apple Commission",
                    photoStatus: PHOTO_STATUSES.SATISFIED,
                    asset: "orgs/wac_apples_2.jpg",
                },
                {
                    id: "washington-wine-commission",
                    title: "Washington Wine Commission",
                    photoStatus: PHOTO_STATUSES.SATISFIED,
                    asset: "orgs/wine_country_2.jpg",
                },
                {
                    id: "we-love-our-pets",
                    title: "We Love Our Pets",
                    photoStatus: PHOTO_STATUSES.SATISFIED,
                    asset: "orgs/pets.jpg",
                },
            ],
        },
        {
            id: "parks",
            title: "Parks and Environment",
            sticker: { style: "green", mark: "PRK" },
            plates: [
                {
                    id: "endangered-wildlife-orca",
                    title: "Endangered Wildlife: Orca",
                    photoStatus: PHOTO_STATUSES.SATISFIED,
                    asset: "parks/endangered_wildlife_orca.jpg",
                },
                {
                    id: "honeybees-and-pollinators",
                    title: "Honeybees and Pollinators",
                    photoStatus: PHOTO_STATUSES.MISSING,
                    asset: null,
                },
                {
                    id: "lighthouse",
                    title: "Lighthouse",
                    photoStatus: PHOTO_STATUSES.SATISFIED,
                    asset: "parks/lighthouse.jpg",
                },
                {
                    id: "san-juan-islands",
                    title: "San Juan Islands",
                    photoStatus: PHOTO_STATUSES.SATISFIED,
                    asset: "parks/san_juan.jpg",
                },
                {
                    id: "state-flower",
                    title: "State Flower",
                    photoStatus: PHOTO_STATUSES.NEEDS_UPGRADE,
                    asset: "parks/rhodie.jpg",
                },
                {
                    id: "washington-national-parks",
                    title: "Washington National Parks",
                    photoStatus: PHOTO_STATUSES.SATISFIED,
                    asset: "parks/natl_parks_2.jpg",
                },
                {
                    id: "washington-state-parks",
                    title: "Washington State Parks",
                    photoStatus: PHOTO_STATUSES.NEEDS_UPGRADE,
                    asset: "parks/state_parks.jpg",
                },
                {
                    id: "washingtons-wildlife-bear",
                    title: "Washington's Wildlife: Bear",
                    photoStatus: PHOTO_STATUSES.SATISFIED,
                    asset: "parks/wa_wildlife_bear.jpg",
                },
                {
                    id: "washingtons-wildlife-deer",
                    title: "Washington's Wildlife: Deer",
                    photoStatus: PHOTO_STATUSES.SATISFIED,
                    asset: "parks/wa_wildlife_deer.jpg",
                },
                {
                    id: "washingtons-wildlife-elk",
                    title: "Washington's Wildlife: Elk",
                    photoStatus: PHOTO_STATUSES.NEEDS_UPGRADE,
                    asset: "parks/wa_wildlife_elk.jpg",
                },
                {
                    id: "washingtons-wildlife-steelhead",
                    title: "Washington's Wildlife: Steelhead",
                    photoStatus: PHOTO_STATUSES.SATISFIED,
                    asset: "parks/wa_wildlife_steelhead.jpg",
                },
                {
                    id: "wild-on-washington-eagle",
                    title: "Wild on Washington: Eagle",
                    photoStatus: PHOTO_STATUSES.SATISFIED,
                    asset: "parks/wild_wa_eagle.jpg",
                },
            ],
        },
        {
            id: "special_interests",
            title: "Special Interests",
            sticker: { style: "blue", mark: "INT" },
            plates: [
                {
                    id: "amateur-radio-operator",
                    title: "Amateur Radio Operator (HAM)",
                    photoStatus: PHOTO_STATUSES.MISSING,
                    asset: null,
                },
                {
                    id: "fly-washington-aviation",
                    title: "Fly Washington Aviation",
                    photoStatus: PHOTO_STATUSES.SATISFIED,
                    asset: "special_interests/fly_wa_aviation.jpg",
                },
                {
                    id: "keep-washington-evergreen",
                    title: "Keep Washington Evergreen",
                    photoStatus: PHOTO_STATUSES.SATISFIED,
                    asset: "special_interests/keep_wa_evergreen.jpg",
                },
                {
                    id: "lemay-americas-car-museum",
                    title: "LeMay - America's Car Museum",
                    photoStatus: PHOTO_STATUSES.SATISFIED,
                    asset: "special_interests/lemay.jpg",
                },
                {
                    id: "music-matters",
                    title: "Music Matters",
                    photoStatus: PHOTO_STATUSES.SATISFIED,
                    asset: "special_interests/music_matters_2.jpg",
                },
                {
                    id: "share-the-road",
                    title: "Share the Road",
                    photoStatus: PHOTO_STATUSES.SATISFIED,
                    asset: "special_interests/share_the_road.jpg",
                },
                {
                    id: "square-dancer",
                    title: "Square Dancer",
                    photoStatus: PHOTO_STATUSES.MISSING,
                    asset: null,
                },
                {
                    id: "throwback",
                    title: "Throwback",
                    photoStatus: PHOTO_STATUSES.SATISFIED,
                    asset: "special_interests/throwback_2.jpg",
                },
            ],
        },
        {
            id: "sports",
            title: "Sports",
            sticker: { style: "red", mark: "SPT" },
            plates: [
                {
                    id: "seattle-kraken",
                    title: "Seattle Kraken",
                    photoStatus: PHOTO_STATUSES.SATISFIED,
                    asset: "sports/kraken.jpg",
                },
                {
                    id: "seattle-mariners",
                    title: "Seattle Mariners",
                    photoStatus: PHOTO_STATUSES.SATISFIED,
                    asset: "sports/mariners.jpg",
                },
                {
                    id: "seattle-seahawks",
                    title: "Seattle Seahawks",
                    photoStatus: PHOTO_STATUSES.SATISFIED,
                    asset: "sports/seahawks_2.jpg",
                },
                {
                    id: "seattle-sounders-fc",
                    title: "Seattle Sounders FC",
                    photoStatus: PHOTO_STATUSES.SATISFIED,
                    asset: "sports/sounders.jpg",
                },
                {
                    id: "seattle-storm",
                    title: "Seattle Storm",
                    photoStatus: PHOTO_STATUSES.SATISFIED,
                    asset: "sports/storm.jpg",
                },
                {
                    id: "ski-and-ride",
                    title: "Ski and Ride",
                    photoStatus: PHOTO_STATUSES.SATISFIED,
                    asset: "sports/ski_and_snowboard.jpg",
                },
                {
                    id: "state-sport-pickleball",
                    title: "State Sport: Pickleball",
                    photoStatus: PHOTO_STATUSES.SATISFIED,
                    asset: "sports/pickleball.jpg",
                },
                {
                    id: "tennis",
                    title: "Tennis",
                    photoStatus: PHOTO_STATUSES.SATISFIED,
                    asset: "sports/tennis.jpg",
                },
                {
                    id: "wrestling",
                    title: "Wrestling",
                    photoStatus: PHOTO_STATUSES.SATISFIED,
                    asset: "sports/wrestling.jpg",
                },
            ],
        },
        {
            id: "tribal_self_issued",
            title: "Tribal, Self-Issued",
            sticker: { style: "black", mark: "TRB", foot: "Self-issued" },
            plates: [
                {
                    id: "colville-tribe",
                    title: "Colville Tribe",
                    photoStatus: PHOTO_STATUSES.MISSING,
                    asset: null,
                },
                {
                    id: "lummi-tribe",
                    title: "Lummi Tribe",
                    photoStatus: PHOTO_STATUSES.MISSING,
                    asset: null,
                },
                {
                    id: "quinault-tribe",
                    title: "Quinault Tribe",
                    photoStatus: PHOTO_STATUSES.MISSING,
                    asset: null,
                },
                {
                    id: "spokane-tribe",
                    title: "Spokane Tribe",
                    photoStatus: PHOTO_STATUSES.MISSING,
                    asset: null,
                },
                {
                    id: "tulalip-tribes",
                    title: "Tulalip Tribes",
                    photoStatus: PHOTO_STATUSES.SATISFIED,
                    asset: "tribal/tulalip_tribes.jpg",
                },
                {
                    id: "yakima-nation",
                    title: "Yakima Nation",
                    photoStatus: PHOTO_STATUSES.SATISFIED,
                    asset: "tribal/yakima_nation_2.jpg",
                },
            ],
        },
        {
            id: "tribal",
            title: "Tribal, WA",
            sticker: { style: "black", mark: "TRB" },
            plates: [
                {
                    id: "chehalis-tribe",
                    title: "Chehalis Tribe",
                    photoStatus: PHOTO_STATUSES.MISSING,
                    asset: null,
                },
                {
                    id: "muckleshoot-tribe",
                    title: "Muckleshoot Tribe",
                    photoStatus: PHOTO_STATUSES.MISSING,
                    asset: null,
                },
                {
                    id: "puyallup-tribe",
                    title: "Puyallup Tribe",
                    photoStatus: PHOTO_STATUSES.MISSING,
                    asset: null,
                },
            ],
        },
        {
            id: "misc",
            title: "Miscellaneous",
            sticker: { style: "blue", mark: "MSC" },
            plates: [
                {
                    id: "dealer-plate",
                    title: "Dealer Plate",
                    photoStatus: PHOTO_STATUSES.SATISFIED,
                    asset: "misc/dealer.jpg",
                },
                {
                    id: "disabled-parking",
                    title: "Disabled Parking",
                    photoStatus: PHOTO_STATUSES.SATISFIED,
                    asset: "misc/disabled.jpg",
                },
                {
                    id: "exempt",
                    title: "Exempt",
                    photoStatus: PHOTO_STATUSES.SATISFIED,
                    asset: "misc/xmt.jpg",
                },
                {
                    id: "personalized",
                    title: "Personalized",
                    photoStatus: PHOTO_STATUSES.SATISFIED,
                    asset: "misc/personalized.jpg",
                },
                {
                    id: "rideshare",
                    title: "Rideshare",
                    photoStatus: PHOTO_STATUSES.SATISFIED,
                    asset: "misc/ride_share.jpg",
                },
                {
                    id: "transporter",
                    title: "Transporter",
                    photoStatus: PHOTO_STATUSES.SATISFIED,
                    asset: "misc/transporter.jpg",
                },
                {
                    id: "wrecker",
                    title: "Wrecker",
                    photoStatus: PHOTO_STATUSES.SATISFIED,
                    asset: "misc/wrecker.jpg",
                },
            ],
        },
    ];

    function variantKindFor(variant) {
        return variant.variantKind || VARIANT_KINDS.PLATE;
    }

    function imageAlt(variant) {
        return `${variant.title} ${variantKindFor(variant)}`;
    }

    function selectedAssetAltTextFor(variant) {
        if (hasOwn(variant, "selectedAssetAltText")) {
            return variant.selectedAssetAltText;
        }
        return imageAlt(variant);
    }

    function displayStickerFor(category) {
        return Object.freeze({
            style: category.sticker.style,
            mark: category.sticker.mark,
            foot: category.sticker.foot || DEFAULT_STICKER_FOOT,
        });
    }

    function categoryFragmentIdFor(category) {
        return (
            CATEGORY_FRAGMENT_OVERRIDES[category.id] ||
            category.sticker.mark.toLowerCase()
        );
    }

    function displayVariantImageFor(variant) {
        if (!variant.asset) return null;
        const paths = selectedAssetPathRules.selectedAssetPaths(variant.asset);

        return Object.freeze({
            thumbnailSrc: paths.thumbnailPath,
            fullSizeSrc: paths.fullSizePath,
            altText: selectedAssetAltTextFor(variant),
        });
    }

    function displayVariantFor(variant, category) {
        const photoStatus = photoStatusPresentationFor(variant, category);
        const image = displayVariantImageFor(variant);

        if (!photoStatus.missingPlaceholder && !image) {
            throw new Error(`${variant.id} requires a Selected Asset`);
        }

        return Object.freeze({
            id: variant.id,
            title: variant.title,
            photoStatus: photoStatus.status,
            image,
            missingPlaceholder: photoStatus.missingPlaceholder,
            badge: photoStatus.badge,
        });
    }

    function displayCategories(sourceCategories = categories) {
        return sourceCategories.map((category) =>
            Object.freeze({
                id: category.id,
                title: category.title,
                fragmentId: categoryFragmentIdFor(category),
                sticker: displayStickerFor(category),
                variants: category.plates.map((variant) =>
                    displayVariantFor(variant, category)
                ),
            })
        );
    }

    function displayChecklistGroup(group) {
        return Object.freeze({
            category: Object.freeze({
                id: group.category.id,
                title: group.category.title,
            }),
            variants: group.plates.map((variant) =>
                Object.freeze({
                    id: variant.id,
                    title: variant.title,
                })
            ),
        });
    }

    function displayChecklistSections(sourceCategories = categories) {
        return CHECKLIST_PHOTO_STATUSES.map((status) => {
            const checklist = photoStatusDetails(status).checklist;
            const groups = checklistGroupsFor(
                status,
                sourceCategories
            ).map(displayChecklistGroup);
            const count = groups.reduce(
                (total, group) => total + group.variants.length,
                0
            );

            return Object.freeze({
                status,
                title: checklist.title,
                emptyMessage: checklist.emptyMessage,
                count,
                groups,
            });
        });
    }

    return {
        browser: Object.freeze({
            displayCategories,
            displayChecklistSections,
        }),
        node: Object.freeze({
            categories,
            photoStatuses: PHOTO_STATUSES,
            variantKinds: VARIANT_KINDS,
            stickerStyles: STICKER_STYLES,
        }),
    };
});
