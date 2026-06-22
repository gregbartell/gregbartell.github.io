(function (root, factory) {
    const api = factory();

    if (typeof module === "object" && module.exports) {
        module.exports = api;
    }
    if (root) {
        root.PlateCatalog = api;
    }
})(typeof window !== "undefined" ? window : globalThis, function () {
    const PHOTO_STATUSES = Object.freeze({
        SATISFIED: "satisfied",
        MISSING: "missing",
        NEEDS_UPGRADE: "needs-upgrade",
    });

    function statusDetails(details) {
        return Object.freeze({
            ...details,
            cardBadge: details.cardBadge
                ? Object.freeze(details.cardBadge)
                : null,
            checklist: details.checklist
                ? Object.freeze(details.checklist)
                : null,
            placeholder: details.placeholder
                ? Object.freeze(details.placeholder)
                : null,
        });
    }

    function hasOwn(object, key) {
        return Object.prototype.hasOwnProperty.call(object, key);
    }

    function isPlainObject(value) {
        return value !== null && typeof value === "object" && !Array.isArray(value);
    }

    function isNonEmptyText(value) {
        return typeof value === "string" && value.trim() !== "";
    }

    function requirePolicyText(errors, value, label) {
        if (!isNonEmptyText(value)) {
            errors.push(`${label} must be non-empty text`);
        }
    }

    const PHOTO_STATUS_DETAILS = Object.freeze({
        [PHOTO_STATUSES.SATISFIED]: statusDetails({
            status: PHOTO_STATUSES.SATISFIED,
            cardBadge: null,
            checklist: null,
            placeholder: null,
        }),
        [PHOTO_STATUSES.MISSING]: statusDetails({
            status: PHOTO_STATUSES.MISSING,
            cardBadge: null,
            checklist: {
                title: "Left to Find",
                emptyMessage: "Collection is complete! \u{1F389}",
            },
            placeholder: {
                ariaSuffix: "photo pending",
                stripDetail: "No photo on file",
                statusValue: "Pending",
                stampText: "Pending",
            },
        }),
        [PHOTO_STATUSES.NEEDS_UPGRADE]: statusDetails({
            status: PHOTO_STATUSES.NEEDS_UPGRADE,
            cardBadge: {
                text: "LOW QUALITY",
                ariaLabel: "Low quality photo",
            },
            checklist: {
                title: "Needs Better Photo",
                emptyMessage: "No upgrades needed. \u{1F44D}",
            },
            placeholder: null,
        }),
    });

    const CHECKLIST_PHOTO_STATUSES = Object.freeze([
        PHOTO_STATUSES.MISSING,
        PHOTO_STATUSES.NEEDS_UPGRADE,
    ]);

    const IMAGE_KINDS = Object.freeze({
        PLATE: "plate",
        EMBLEM: "emblem",
    });

    const STICKER_STYLES = Object.freeze(["black", "blue", "green", "red"]);
    const DEFAULT_STICKER_FOOT = "WASHINGTON";
    const FULL_SIZE_IMAGE_ROOT = "pics";
    const THUMBNAIL_IMAGE_ROOT = "pics/thumbs";

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
                    photoStatus: PHOTO_STATUSES.MISSING,
                    asset: null,
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
                    imageKind: IMAGE_KINDS.EMBLEM,
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
                    title: "Military Affiliate Radio System (MARS)",
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
                    title: "Veteran/Military Service Award emblems",
                    photoStatus: PHOTO_STATUSES.NEEDS_UPGRADE,
                    imageKind: IMAGE_KINDS.EMBLEM,
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
                    photoStatus: PHOTO_STATUSES.MISSING,
                    asset: null,
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
                    photoStatus: PHOTO_STATUSES.NEEDS_UPGRADE,
                    asset: "orgs/freemason.jpg",
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
                    asset: "orgs/wine_country.jpg",
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
                    asset: "parks/natl_parks.jpg",
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
                    photoStatus: PHOTO_STATUSES.NEEDS_UPGRADE,
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
                    photoStatus: PHOTO_STATUSES.MISSING,
                    asset: null,
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
                    photoStatus: PHOTO_STATUSES.NEEDS_UPGRADE,
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
                    photoStatus: PHOTO_STATUSES.NEEDS_UPGRADE,
                    asset: "tribal/yakima_nation.jpg",
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
            ],
        },
    ];

    function photoStatusFor(plate) {
        return plate.photoStatus;
    }

    function photoStatusDetailsFor(plate) {
        return photoStatusDetailsForStatus(photoStatusFor(plate));
    }

    function photoStatusDetailsForStatus(status) {
        const details = PHOTO_STATUS_DETAILS[status];
        if (!details) {
            throw new Error(`Unknown photoStatus: ${status}`);
        }
        return details;
    }

    function photoStatusBadgeFor(plate) {
        const { cardBadge } = photoStatusDetailsFor(plate);
        if (!cardBadge) return null;

        return Object.freeze({
            text: cardBadge.text,
            ariaLabel: cardBadge.ariaLabel,
        });
    }

    function missingPhotoPlaceholderFor(plate, category) {
        const { placeholder } = photoStatusDetailsFor(plate);
        if (!placeholder) return null;
        if (!category || !isNonEmptyText(category.title)) {
            throw new Error(
                `${plate.id} requires a Category for missing-photo placeholder display`
            );
        }

        return Object.freeze({
            ariaLabel: `${imageAlt(plate)} \u2014 ${placeholder.ariaSuffix}`,
            stripDetail: placeholder.stripDetail,
            plateTitle: plate.title,
            categoryTitle: category.title,
            statusText: placeholder.statusValue,
            stampText: placeholder.stampText,
        });
    }

    function photoStatusPresentationFor(plate, category) {
        return Object.freeze({
            status: photoStatusFor(plate),
            badge: photoStatusBadgeFor(plate),
            missingPlaceholder: missingPhotoPlaceholderFor(plate, category),
        });
    }

    function imageKindFor(plate) {
        return plate.imageKind || IMAGE_KINDS.PLATE;
    }

    function imageAlt(plate) {
        return `${plate.title} ${imageKindFor(plate)}`;
    }

    function thumbnailPath(asset) {
        return asset ? `${THUMBNAIL_IMAGE_ROOT}/${asset}` : null;
    }

    function fullImagePath(asset) {
        return asset ? `${FULL_SIZE_IMAGE_ROOT}/${asset}` : null;
    }

    function selectedAssetFor(plate) {
        if (!plate.asset) return null;

        return Object.freeze({
            asset: plate.asset,
            fullSizePath: fullImagePath(plate.asset),
            thumbnailPath: thumbnailPath(plate.asset),
            altText: imageAlt(plate),
            imageKind: imageKindFor(plate),
        });
    }

    function selectedAssetEntries(sourceCategories = categories) {
        return getPlateEntries(sourceCategories)
            .map(({ category, plate }) => ({
                category,
                plate,
                selectedAsset: selectedAssetFor(plate),
            }))
            .filter(({ selectedAsset }) => selectedAsset !== null);
    }

    function selectedAssetFilePaths(sourceCategories = categories) {
        const entries = selectedAssetEntries(sourceCategories);
        return {
            fullSizePaths: entries.map(
                ({ selectedAsset }) => selectedAsset.fullSizePath
            ),
            thumbnailPaths: entries.map(
                ({ selectedAsset }) => selectedAsset.thumbnailPath
            ),
        };
    }

    function assetFromFullSizePath(fullSizePath) {
        const prefix = `${FULL_SIZE_IMAGE_ROOT}/`;
        if (typeof fullSizePath !== "string") return null;
        if (!fullSizePath.startsWith(prefix)) return null;
        if (fullSizePath.startsWith(`${THUMBNAIL_IMAGE_ROOT}/`)) return null;
        return fullSizePath.slice(prefix.length);
    }

    function unselectedLocalImages({
        sourceCategories = categories,
        fullSizePaths,
        thumbnailPaths = [],
    } = {}) {
        if (!Array.isArray(fullSizePaths)) {
            throw new Error("fullSizePaths must be an array");
        }
        if (!Array.isArray(thumbnailPaths)) {
            throw new Error("thumbnailPaths must be an array");
        }

        const selectedFullSizePaths = new Set(
            selectedAssetFilePaths(sourceCategories).fullSizePaths
        );
        const localThumbnailPaths = new Set(thumbnailPaths);

        return fullSizePaths
            .filter((fullSizePath) => !selectedFullSizePaths.has(fullSizePath))
            .map((fullSizePath) => {
                const asset = assetFromFullSizePath(fullSizePath);
                const expectedThumbnailPath = thumbnailPath(asset);

                return Object.freeze({
                    asset,
                    fullSizePath,
                    thumbnailPath: expectedThumbnailPath,
                    hasMatchingThumbnail:
                        expectedThumbnailPath !== null &&
                        localThumbnailPaths.has(expectedThumbnailPath),
                });
            });
    }

    function getPlateEntries(sourceCategories = categories) {
        return sourceCategories.flatMap((category) =>
            category.plates.map((plate) => ({ category, plate }))
        );
    }

    function categoriesWithStatus(status, sourceCategories = categories) {
        return sourceCategories
            .map((category) => ({
                category,
                plates: category.plates.filter(
                    (plate) => photoStatusFor(plate) === status
                ),
            }))
            .filter((group) => group.plates.length > 0);
    }

    function checklistSections(sourceCategories = categories) {
        return CHECKLIST_PHOTO_STATUSES.map((status) => {
            const details = photoStatusDetailsForStatus(status);
            return {
                status,
                title: details.checklist.title,
                emptyMessage: details.checklist.emptyMessage,
                groups: categoriesWithStatus(status, sourceCategories),
            };
        });
    }

    function validatePhotoStatusDetails(errors) {
        const photoStatuses = Object.values(PHOTO_STATUSES);
        const validPhotoStatuses = new Set(photoStatuses);

        if (!isPlainObject(PHOTO_STATUS_DETAILS)) {
            errors.push("Photo Status policy details must be an object");
            return;
        }

        photoStatuses.forEach((status) => {
            if (!hasOwn(PHOTO_STATUS_DETAILS, status)) {
                errors.push(`Photo Status policy missing status: ${status}`);
            }
        });

        Object.entries(PHOTO_STATUS_DETAILS).forEach(([status, details]) => {
            const prefix = `Photo Status policy for ${status}`;

            if (!validPhotoStatuses.has(status)) {
                errors.push(`Photo Status policy has unknown status: ${status}`);
            }
            if (!isPlainObject(details)) {
                errors.push(`${prefix} must be an object`);
                return;
            }
            if (details.status !== status) {
                errors.push(`${prefix} must set status to ${status}`);
            }

            if (details.cardBadge !== null) {
                if (!isPlainObject(details.cardBadge)) {
                    errors.push(`${prefix} badge must be null or an object`);
                } else {
                    requirePolicyText(
                        errors,
                        details.cardBadge.text,
                        `${prefix} badge text`
                    );
                    requirePolicyText(
                        errors,
                        details.cardBadge.ariaLabel,
                        `${prefix} badge aria label`
                    );
                }
            }

            if (details.checklist !== null) {
                if (!isPlainObject(details.checklist)) {
                    errors.push(`${prefix} checklist must be null or an object`);
                } else {
                    requirePolicyText(
                        errors,
                        details.checklist.title,
                        `${prefix} checklist title`
                    );
                    requirePolicyText(
                        errors,
                        details.checklist.emptyMessage,
                        `${prefix} checklist empty message`
                    );
                }
            }

            if (details.placeholder !== null) {
                if (!isPlainObject(details.placeholder)) {
                    errors.push(
                        `${prefix} missing-photo placeholder must be null or an object`
                    );
                } else {
                    [
                        "ariaSuffix",
                        "stripDetail",
                        "statusValue",
                        "stampText",
                    ].forEach((property) => {
                        requirePolicyText(
                            errors,
                            details.placeholder[property],
                            `${prefix} missing-photo placeholder ${property}`
                        );
                    });
                }
            }
        });
    }

    function validatePhotoStatusPresentation(errors, sourceCategories) {
        getPlateEntries(sourceCategories).forEach(({ category, plate }) => {
            const prefix = `${category.id}/${plate.id}`;
            let presentation;

            try {
                presentation = photoStatusPresentationFor(plate, category);
            } catch (error) {
                errors.push(
                    `${prefix} Photo Status presentation failed: ${error.message}`
                );
                return;
            }

            if (presentation.status !== photoStatusFor(plate)) {
                errors.push(`${prefix} Photo Status presentation status drifted`);
            }

            if (presentation.badge !== null) {
                if (!isPlainObject(presentation.badge)) {
                    errors.push(`${prefix} Photo Status badge must be null or object`);
                } else {
                    requirePolicyText(
                        errors,
                        presentation.badge.text,
                        `${prefix} Photo Status badge text`
                    );
                    requirePolicyText(
                        errors,
                        presentation.badge.ariaLabel,
                        `${prefix} Photo Status badge aria label`
                    );
                }
            }

            if (presentation.missingPlaceholder !== null) {
                if (!isPlainObject(presentation.missingPlaceholder)) {
                    errors.push(
                        `${prefix} missing-photo placeholder must be null or object`
                    );
                } else {
                    [
                        "ariaLabel",
                        "stripDetail",
                        "plateTitle",
                        "categoryTitle",
                        "statusText",
                        "stampText",
                    ].forEach((property) => {
                        requirePolicyText(
                            errors,
                            presentation.missingPlaceholder[property],
                            `${prefix} missing-photo placeholder ${property}`
                        );
                    });
                }
            }
        });
    }

    function validatePhotoStatusChecklist(errors, sourceCategories) {
        let sections;
        const checklistStatusSet = new Set(CHECKLIST_PHOTO_STATUSES);

        Object.entries(PHOTO_STATUS_DETAILS).forEach(([status, details]) => {
            if (details?.checklist && !checklistStatusSet.has(status)) {
                errors.push(
                    `Photo Status policy for ${status} has checklist display but is not included in checklist sections`
                );
            }
        });

        try {
            sections = checklistSections(sourceCategories);
        } catch (error) {
            errors.push(`Photo Status checklist failed: ${error.message}`);
            return;
        }

        if (!Array.isArray(sections)) {
            errors.push("Photo Status checklist sections must be an array");
            return;
        }

        sections.forEach((section, index) => {
            const prefix = `Photo Status checklist section ${index}`;
            const details = PHOTO_STATUS_DETAILS[section.status];

            if (!details || !details.checklist) {
                errors.push(`${prefix} uses a non-checklist status`);
                return;
            }

            if (section.title !== details.checklist.title) {
                errors.push(`${prefix} title must come from Photo Status policy`);
            }
            if (section.emptyMessage !== details.checklist.emptyMessage) {
                errors.push(
                    `${prefix} empty message must come from Photo Status policy`
                );
            }
            if (!Array.isArray(section.groups)) {
                errors.push(`${prefix} groups must be an array`);
            }
        });
    }

    function validatePhotoStatusPolicy(sourceCategories = categories) {
        const errors = [];

        validatePhotoStatusDetails(errors);
        validatePhotoStatusPresentation(errors, sourceCategories);
        validatePhotoStatusChecklist(errors, sourceCategories);

        return errors;
    }

    return {
        categories,
        photoStatuses: PHOTO_STATUSES,
        imageKinds: IMAGE_KINDS,
        stickerStyles: STICKER_STYLES,
        defaultStickerFoot: DEFAULT_STICKER_FOOT,
        photoStatusFor,
        photoStatusPresentationFor,
        imageKindFor,
        imageAlt,
        thumbnailPath,
        fullImagePath,
        selectedAssetFor,
        selectedAssetEntries,
        selectedAssetFilePaths,
        unselectedLocalImages,
        getPlateEntries,
        categoriesWithStatus,
        checklistSections,
        validatePhotoStatusPolicy,
    };
});
